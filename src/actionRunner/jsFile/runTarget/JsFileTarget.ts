import {RunOptions} from "../../../runOptions/RunOptions";
import {JsFileRunResult} from "../runResult/JsFileRunResult";
import {spawnChildProc} from "./spawnChildProc";
import {StdoutCommandsExtractor} from "../../../stdout/StdoutCommandsExtractor";
import {CommandsStore} from "../../../runResult/CommandsStore";
import {ActionConfigSource, ActionConfigStore, ActionConfigStoreOptional} from "../../../runOptions/ActionConfigStore";
import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import {ChildProcRunMilieuFactory} from "../runMilieu/ChildProcRunMilieuFactory";
import os from "os";
import {SpawnProc} from "../../../utils/spawnProc";
import {Duration} from "../../../utils/Duration";
import {ChildProcRunMilieuComponentsFactory} from "../runMilieu/ChildProcRunMilieuComponentsFactory";
import assert from "assert";
import path from "path";
import {AsyncRunTargetInterface} from "../../../runTarget/AsyncRunTargetInterface";
import {JsFileRunResultInterface} from "../runResult/JsFileRunResultInterface";

type ScriptName = 'pre'|'main'|'post';

export class JsFileTarget implements AsyncRunTargetInterface {
    // noinspection JSUnusedGlobalSymbols
    static createMain(actionConfig: ActionConfigInterface, filePathPrefix: string): JsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createMain(actionYmlPath: string): JsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createMain(actionConfigSource: ActionConfigSource, filePathPrefix?: string): JsFileTarget {
        return JsFileTarget.createFromConfigRunsKey('main', actionConfigSource, filePathPrefix);
    }

    // noinspection JSUnusedGlobalSymbols
    static createPre(actionConfig: ActionConfigInterface, filePathPrefix: string): JsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createPre(actionYmlPath: string): JsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createPre(actionConfigSource: ActionConfigSource, filePathPrefix?: string): JsFileTarget {
        return JsFileTarget.createFromConfigRunsKey('pre', actionConfigSource, filePathPrefix);
    }

    // noinspection JSUnusedGlobalSymbols
    static createPost(actionConfig: ActionConfigInterface, filePathPrefix: string): JsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createPost(actionYmlPath: string): JsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createPost(actionConfigSource: ActionConfigSource, filePathPrefix?: string): JsFileTarget {
        return JsFileTarget.createFromConfigRunsKey('post', actionConfigSource, filePathPrefix);
    }

    // noinspection JSUnusedGlobalSymbols
    static createForFile(jsFilePath: string, actionConfig?: ActionConfigInterface): JsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createForFile(jsFilePath: string, actionYmlPath?: string): JsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createForFile(jsFilePath: string, actionConfigSource?: ActionConfigSource): JsFileTarget {
        const actionConfig = ActionConfigStore.create(actionConfigSource, false);
        return new JsFileTarget(
            jsFilePath,
            actionConfig,
            typeof actionConfigSource === 'string' ? actionConfigSource : undefined
        );
    }

    protected static createFromConfigRunsKey(
        scriptName: ScriptName,
        actionConfigSource: ActionConfigSource,
        filePathPrefix?: string
    ): JsFileTarget {
        const actionConfig = ActionConfigStore.create(actionConfigSource, true);
        assert(actionConfig.data.runs.using.startsWith('node'), "Passed action config has 'runs' != node");
        let targetFilePath = actionConfig.data.runs[scriptName];
        assert(targetFilePath !== undefined, `Action config doesn't have "${scriptName}" key in "runs" section`);
        if (filePathPrefix === undefined) {
            assert(typeof actionConfigSource === 'string');
            filePathPrefix = path.dirname(actionConfigSource);
        }
        targetFilePath = path.resolve(filePathPrefix, targetFilePath);
        return new JsFileTarget(
            targetFilePath,
            actionConfig,
            typeof actionConfigSource === 'string' ? actionConfigSource : undefined
        );
    }

    public isAsync: true = true;

    protected constructor(
        public readonly jsFilePath: string,
        public readonly actionConfig: ActionConfigStoreOptional,
        public readonly actionYmlPath: string|undefined,
    ) {}

    async run(options: RunOptions): Promise<JsFileRunResultInterface>
    {
        const runMilieu = (new ChildProcRunMilieuFactory(
            new ChildProcRunMilieuComponentsFactory(options, this.actionConfig)
        )).createMilieu(options.validate());
        const duration = Duration.startMeasuring();
        const spawnResult = await spawnChildProc(
            this.jsFilePath,
            options,
            runMilieu.env,
            options.outputOptions.data.printStdout,
            options.outputOptions.stdoutTransform,
            options.outputOptions.data.printStderr,
            options.outputOptions.stderrTransform
        );
        const durationMs = duration.measureMs();
        if ((spawnResult.stderr && !options.outputOptions.data.printStderr) || spawnResult.error) {
            SpawnProc.debugError(spawnResult);
        }
        if (options.outputOptions.data.printRunnerDebug) {
            process.stdout.write(`Process finished with status code = ${spawnResult.status}` + os.EOL);
        }
        try {
            const commands = spawnResult.stdout && options.outputOptions.data.parseStdoutCommands
                ? StdoutCommandsExtractor.extract(spawnResult.stdout)
                : new CommandsStore();
            const effects = runMilieu.getEffects(os.EOL);
            if (options.fakeFsOptions.data.fakeCommandFiles) {
                commands.apply(effects.fileCommands);
            }
            return new JsFileRunResult(
                commands.data,
                spawnResult.error,
                spawnResult.status !== null ? spawnResult.status : undefined,
                spawnResult.stdout,
                spawnResult.stderr,
                durationMs,
                effects.runnerDirs.data.temp,
                effects.runnerDirs.data.workspace,
                spawnResult
            );
        } finally {
            runMilieu.restore();
        }
    }

    clone(): this {
        return new JsFileTarget(
            this.jsFilePath,
            this.actionConfig.clone(),
            this.actionYmlPath
        ) as this;
    }
}