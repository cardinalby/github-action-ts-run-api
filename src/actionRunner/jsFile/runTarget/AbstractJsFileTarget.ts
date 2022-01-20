import {SyncRunTargetInterface} from "../../../runTarget/SyncRunTargetInterface";
import {RunOptions} from "../../../runOptions/RunOptions";
import {JsFileRunResult} from "../JsFileRunResult";
import {ChildProcExecutionEnvironment} from "../executionEnvironment/ChildProcExecutionEnvironment";
import {spawnChildProc} from "./spawnChildProc";
import {StdoutCommandsExtractor} from "../../../stdout/StdoutCommandsExtractor";
import {CommandsStore} from "../../../stores/CommandsStore";
import {ActionConfigStoreOptional} from "../../../stores/ActionConfigStore";

export abstract class AbstractJsFileTarget implements SyncRunTargetInterface {
    protected constructor(
        public readonly jsFilePath: string,
        public readonly actionConfig: ActionConfigStoreOptional,
        public readonly actionYmlPath: string|undefined,
    ) {}

    run(options: RunOptions): JsFileRunResult
    {
        const execEnvironment = ChildProcExecutionEnvironment.prepare(this, options.validate());
        const spawnResult = spawnChildProc(this, options, execEnvironment.env);
        try {
            if (spawnResult.stdout && options.shouldPrintStdout) {
                process.stdout.write(spawnResult.stdout);
            }
            const commands = spawnResult.stdout && options.shouldParseStdout
                ? StdoutCommandsExtractor.extract(spawnResult.stdout)
                : new CommandsStore();
            const effects = execEnvironment.getEffects();
            if (options.fakeFileOptions.data.fakeCommandFiles) {
                commands.apply(effects.fileCommands);
            }
            return new JsFileRunResult(
                commands.data,
                spawnResult.error,
                spawnResult.status !== null ? spawnResult.status : undefined,
                spawnResult.stdout,
                effects.tempDir,
                spawnResult
            );
        } finally {
            execEnvironment.restore();
        }
    }

    clone(): this {
        return new (<any>this.constructor)(
            this.jsFilePath,
            this.actionConfig.clone()
        ) as this;
    }
}