import {ActionConfigStore, ActionConfigStoreFilled} from "../../../runOptions/ActionConfigStore";
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
import {ExternalRunnerDir} from "../../../githubServiceFiles/runnerDir/ExternalRunnerDir";
import {DockerOptions} from "./DockerOptions";
import {Duration} from "../../../utils/Duration";
import {AsyncRunTargetInterface} from "../../../runTarget/AsyncRunTargetInterface";
import {SpawnAsyncResult} from "../../../utils/spawnAsync";
import {SpawnProc} from "../../../utils/spawnProc";
import {DockerOptionsStore} from "./DockerOptionsStore";

export class DockerTarget implements AsyncRunTargetInterface {
    static readonly DEFAULT_WORKING_DIR = '/github/workspace';

    static createFromActionYml(
        actionYmlPath: string,
        dockerOptions: Partial<DockerOptions> = {}
    ): DockerTarget {
        const actionConfig = ActionConfigStore.fromFile(actionYmlPath);
        assert(actionConfig.data.runs.using.startsWith('docker'), "Passed action config is not runs using docker");
        assert(actionConfig.data.runs.image !== undefined, `Action config doesn't have "image" key in "runs" section`);
        const dockerFilePath = actionConfig.data.runs.image;
        const containerArgs = getContainerArgs(actionConfig.data);
        const dockerOptionsStore = (new DockerOptionsStore({
            runUnderCurrentLinuxUser: true,
            network: undefined
        })).apply(dockerOptions);

        return new DockerTarget(
            actionConfig,
            actionYmlPath,
            containerArgs,
            dockerFilePath,
            undefined,
            dockerOptionsStore
        );
    }

    public isAsync: true = true;

    protected constructor(
        public readonly actionConfig: ActionConfigStoreFilled,
        public readonly actionYmlPath: string,
        private readonly containerArgs: (InputContainerArg|string)[],
        private readonly dockerFilePath: string,
        private imageId: string|undefined,
        public readonly dockerOptions: DockerOptionsStore
    ) {
        assert(actionConfig.data.runs.image !== undefined, `Action config doesn't have "image" key in "runs" section`);
        this.dockerFilePath = actionConfig.data.runs.image;
        this.containerArgs = getContainerArgs(actionConfig.data);
    }

    async build(printDebug: boolean = false): Promise<SpawnAsyncResult> {
        const workdir = path.resolve(path.dirname(this.actionYmlPath));
        const spawnResult = await DockerCli.build(
            workdir,
            path.resolve(workdir, this.dockerFilePath),
            printDebug
        );
        printDebug && SpawnProc.debugError(spawnResult);
        if (spawnResult.status === 0) {
            this.imageId = spawnResult.stdout.trim();
        }
        return spawnResult;
    }

    async run(options: RunOptions): Promise<DockerRunResult>
    {
        let buildSpawnResult: SpawnAsyncResult|undefined = undefined;
        if (!this.imageId) {
            const buildDuration = Duration.startMeasuring();
            buildSpawnResult = await this.build(options.outputOptions.data.printRunnerDebug);
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
        const spawnResult = await DockerCli.run(
            this.imageId,
            runMilieu.env,
            runMilieu.volumes,
            options.workingDir || DockerTarget.DEFAULT_WORKING_DIR,
            this.dockerOptions.getCurrentUserForRun(),
            this.dockerOptions.data.network,
            args,
            options.timeoutMs,
            options.outputOptions.data.printRunnerDebug,
            options.outputOptions.shouldPrintStdout,
            options.outputOptions.data.printStderr,
        );
        const durationMs = duration.measureMs();
        try {
            if (spawnResult.stderr && !options.outputOptions.data.printStderr) {
                SpawnProc.debugError(spawnResult);
            } else if (spawnResult.error) {
                SpawnProc.debugError(spawnResult);
            }
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
            this.dockerOptions.clone()
        ) as this;
    }
}