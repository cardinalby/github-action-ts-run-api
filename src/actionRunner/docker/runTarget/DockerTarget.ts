import {
    ActionConfigStore,
    ActionConfigStoreFilled
} from "../../../runOptions/ActionConfigStore";
import {RunOptions} from "../../../runOptions/RunOptions";
import {StdoutCommandsExtractor} from "../../../stdout/StdoutCommandsExtractor";
import {CommandsStore} from "../../../runResult/CommandsStore";
import {DockerCli} from "./dockerCli";
import assert from "assert";
import path from "path";
import {DockerRunResult} from "../DockerRunResult";
import {getContainerArgs, InputContainerArg} from "./getContainerArgs";
import {DockerRunMilieuFactory} from "../runMilieu/DockerRunMilieuFactory";
import {DockerRunMilieuComponentsFactory} from "../runMilieu/DockerRunMilieuComponentsFactory";
import {SpawnSyncReturns} from "child_process";
import {ExternalRunnerDir} from "../../../githubServiceFiles/runnerDir/ExternalRunnerDir";
import {SpawnProc} from "../../../utils/spawnProc";
import * as os from "os";
import {DockerTargetOptions} from "./DockerTargetOptions";
import {UserInfo} from "os";
import {Duration} from "../../../utils/Duration";

function debugSpawnError(spawnRes: SpawnSyncReturns<string>) {
    if (spawnRes.error) {
        process.stderr.write(spawnRes.error.toString() + os.EOL);
    }
    if (spawnRes.status !== 0) {
        process.stderr.write(`Finished with status = ${spawnRes.status}, ${spawnRes.stderr}` + os.EOL);
    }
}

let userInfo: UserInfo<string>|undefined;
export function getCurrentUserForRun(): string|undefined {
    if (os.platform() !== 'linux') {
        return undefined;
    }
    if (userInfo === undefined) {
        userInfo = os.userInfo();
    }
    if (userInfo.uid < 0 || userInfo.gid < 0) {
        return undefined;
    }
    return `${userInfo.uid}:${userInfo.gid}`;
}

export class DockerTarget {
    static readonly DEFAULT_WORKING_DIR = '/github/workspace';

    static createFromActionYml(
        actionYmlPath: string,
        dockerOptions: DockerTargetOptions = { runUnderCurrentLinuxUser: true }
    ): DockerTarget {
        const actionConfig = ActionConfigStore.fromFile(actionYmlPath);
        assert(actionConfig.data.runs.using.startsWith('docker'), "Passed action config is not runs using docker");
        assert(actionConfig.data.runs.image !== undefined, `Action config doesn't have "image" key in "runs" section`);
        const dockerFilePath = actionConfig.data.runs.image;
        const containerArgs = getContainerArgs(actionConfig.data);
        return new DockerTarget(
            actionConfig,
            actionYmlPath,
            containerArgs,
            dockerFilePath,
            undefined,
            dockerOptions.runUnderCurrentLinuxUser ? getCurrentUserForRun() : undefined
        );
    }

    protected constructor(
        public readonly actionConfig: ActionConfigStoreFilled,
        public readonly actionYmlPath: string,
        private readonly containerArgs: (InputContainerArg|string)[],
        private readonly dockerFilePath: string,
        private imageId: string|undefined,
        private readonly userToRunUnder: string|undefined,
    ) {
        assert(actionConfig.data.runs.image !== undefined, `Action config doesn't have "image" key in "runs" section`);
        this.dockerFilePath = actionConfig.data.runs.image;
        this.containerArgs = getContainerArgs(actionConfig.data);
    }

    build(printDebug: boolean = false): SpawnSyncReturns<string> {
        const workdir = path.resolve(path.dirname(this.actionYmlPath));
        const spawnResult = DockerCli.build(
            workdir,
            path.resolve(workdir, this.dockerFilePath),
            printDebug
        );
        printDebug && debugSpawnError(spawnResult);
        if (spawnResult.status === 0) {
            this.imageId = spawnResult.stdout.trim();
        }
        return spawnResult;
    }

    run(options: RunOptions): DockerRunResult
    {
        let buildSpawnResult: SpawnSyncReturns<string>|undefined = undefined;
        if (!this.imageId) {
            const buildDuration = Duration.startMeasuring();
            buildSpawnResult = this.build(options.outputOptions.data.printRunnerDebug);
            if (buildSpawnResult.error || buildSpawnResult.status !== 0) {
                return new DockerRunResult(
                    (new CommandsStore()).data,
                    buildSpawnResult.error ||
                        new Error('Docker build error. ' + (buildSpawnResult.stderr || '')),
                    buildSpawnResult.status !== null
                        ? buildSpawnResult.status
                        : undefined,
                    undefined,
                    undefined,
                    buildDuration.measureMs(),
                    options.tempDir
                        ? new ExternalRunnerDir(options.tempDir)
                        : { existingDirPath: undefined },
                    options.workspaceDir
                        ? new ExternalRunnerDir(options.workspaceDir)
                        : { existingDirPath: undefined },
                    buildSpawnResult,
                    undefined,
                    false
                );
            }
            assert(this.imageId);
        }

        const runMilieu = (new DockerRunMilieuFactory(
            new DockerRunMilieuComponentsFactory(options, this.actionConfig, this.actionYmlPath)
        )).createMilieu(options.validate());
        const effectiveInputs = this.actionConfig.getDefaultInputs().apply(options.inputs.data);
        const args = this.containerArgs.map(arg => arg instanceof InputContainerArg
            ? effectiveInputs.data[arg.inputName] || ''
            : arg
        );
        const duration = Duration.startMeasuring();
        const spawnResult = DockerCli.run(
            this.imageId,
            runMilieu.env,
            runMilieu.volumes,
            options.workingDir || DockerTarget.DEFAULT_WORKING_DIR,
            this.userToRunUnder,
            args,
            options.timeoutMs,
            options.outputOptions.data.printRunnerDebug
        );
        const durationMs = duration.measureMs();
        try {
            if (spawnResult.stderr && !options.outputOptions.data.printStderr) {
                debugSpawnError(spawnResult);
            } else if (spawnResult.error) {
                debugSpawnError(spawnResult);
            }
            SpawnProc.printOutput(
                spawnResult, options.outputOptions.shouldPrintStdout, options.outputOptions.data.printStderr
            );
            const commands = spawnResult.stdout && options.outputOptions.data.parseStdoutCommands
                ? StdoutCommandsExtractor.extract(spawnResult.stdout)
                : new CommandsStore();
            const effects = runMilieu.getEffects();
            if (options.fakeFsOptions.data.fakeCommandFiles) {
                commands.apply(effects.fileCommands);
            }
            return new DockerRunResult(
                commands.data,
                spawnResult.error,
                spawnResult.status !== null ? spawnResult.status : undefined,
                spawnResult.stdout,
                spawnResult.stderr,
                durationMs,
                effects.runnerDirs.data.temp,
                effects.runnerDirs.data.workspace,
                buildSpawnResult,
                spawnResult,
                true
            );
        } finally {
            runMilieu.restore();
        }
    }

    clone(): this {
        return new DockerTarget(
            this.actionConfig.clone(),
            this.actionYmlPath,
            [...this.containerArgs],
            this.dockerFilePath,
            this.imageId,
            this.userToRunUnder
        ) as this;
    }
}