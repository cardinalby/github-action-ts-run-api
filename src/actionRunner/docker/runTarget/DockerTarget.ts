import {
    ActionConfigSource,
    ActionConfigStore,
    ActionConfigStoreOptional
} from "../../../runOptions/ActionConfigStore";
import {RunOptions} from "../../../runOptions/RunOptions";
import {StdoutCommandsExtractor} from "../../../stdout/StdoutCommandsExtractor";
import {CommandsStore} from "../../../runResult/CommandsStore";
import {DockerCli} from "./dockerCli";
import assert from "assert";
import path from "path";
import {DockerRunResult} from "../runResult/DockerRunResult";
import {getContainerArgs, InputContainerArg} from "./getContainerArgs";
import {DockerRunMilieuFactory} from "../runMilieu/DockerRunMilieuFactory";
import {DockerRunMilieuComponentsFactory} from "../runMilieu/DockerRunMilieuComponentsFactory";
import {ExternalRunnerDir} from "../../../githubServiceFiles/runnerDir/ExternalRunnerDir";
import {DockerOptionsInterface} from "./DockerOptionsInterface";
import {Duration} from "../../../utils/Duration";
import {AsyncRunTargetInterface} from "../../../runTarget/AsyncRunTargetInterface";
import {SpawnAsyncResult} from "../../../utils/spawnAsync";
import {SpawnProc} from "../../../utils/spawnProc";
import {DockerOptionsStore} from "./DockerOptionsStore";
import {ActionConfigInterface} from "../../../types/ActionConfigInterface";

export class DockerTarget implements AsyncRunTargetInterface {
    static readonly DEFAULT_WORKING_DIR = '/github/workspace';

    static createFromActionYml(
        actionYmlPath: string,
        dockerOptions?: Partial<DockerOptionsInterface>
    ): DockerTarget {
        const actionConfig = ActionConfigStore.fromFile(actionYmlPath);
        assert(actionConfig.data.runs.using.startsWith('docker'), "Passed action config runs.using != docker");
        assert(actionConfig.data.runs.image !== undefined, `Action config doesn't have "image" key in "runs" section`);
        const dockerfilePath = actionConfig.data.runs.image;
        const containerArgs = getContainerArgs(actionConfig.data);
        return new DockerTarget(
            actionConfig,
            actionYmlPath,
            containerArgs,
            path.resolve(path.dirname(actionYmlPath), dockerfilePath),
            undefined,
            DockerOptionsStore.create(dockerOptions)
        );
    }

    static createForDockerfile(
        dockerfilePath: string,
        actionConfig?: ActionConfigInterface,
        dockerOptions?: Partial<DockerOptionsInterface>
    ): DockerTarget
    static createForDockerfile(
        dockerfilePath: string,
        actionYmlPath?: string,
        dockerOptions?: Partial<DockerOptionsInterface>
    ): DockerTarget
    static createForDockerfile(
        dockerfilePath: string,
        actionConfigSource?: ActionConfigSource,
        dockerOptions?: Partial<DockerOptionsInterface>
    ): DockerTarget {
        const actionConfig = ActionConfigStore.create(actionConfigSource, false);
        if (actionConfig.data) {
            assert(actionConfig.data.runs.using.startsWith('docker'), "Passed action config runs.using != docker");
        }
        return new DockerTarget(
            actionConfig,
            typeof actionConfigSource === 'string' ? actionConfigSource : undefined,
            actionConfig.data ? getContainerArgs(actionConfig.data) : [],
            dockerfilePath,
            undefined,
            DockerOptionsStore.create(dockerOptions)
        )
    }

    public isAsync: true = true;

    // noinspection JSUnusedGlobalSymbols
    protected constructor(
        public readonly actionConfig: ActionConfigStoreOptional,
        public readonly actionYmlPath: string|undefined,
        private readonly containerArgs: (InputContainerArg|string)[],
        private readonly dockerFilePath: string,
        private imageId: string|undefined,
        public readonly dockerOptions: DockerOptionsStore
    ) {
    }

    async build(printDebug: boolean = false): Promise<SpawnAsyncResult> {
        const spawnResult = await DockerCli.build(
            this.dockerFilePath,
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
            new DockerRunMilieuComponentsFactory(options, this.actionConfig)
        )).createMilieu(options.validate());
        const effectiveInputs = this.actionConfig.getDefaultInputs().apply(options.inputs.data);
        const args = this.containerArgs.map(arg => arg instanceof InputContainerArg
            ? effectiveInputs.data[arg.inputName] || ''
            : arg
        );
        const duration = Duration.startMeasuring();
        const spawnResult = await DockerCli.runAndWait({
            imageId: this.imageId,
            env: runMilieu.env,
            volumes: runMilieu.volumes,
            workdir: options.workingDir || DockerTarget.DEFAULT_WORKING_DIR,
            user: this.dockerOptions.getUserForRun(),
            network: this.dockerOptions.data.network,
            args: args,
            timeoutMs: options.timeoutMs,
            printDebug: options.outputOptions.data.printRunnerDebug,
            printStdout: options.outputOptions.data.printStdout,
            stdoutTransform: options.outputOptions.stdoutTransform,
            printStderr: options.outputOptions.data.printStderr,
        });
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