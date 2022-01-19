import {SyncRunTargetInterface} from "../../../runTarget/SyncRunTargetInterface";
import {RunOptions} from "../../../runOptions/RunOptions";
import {JsFileRunResult} from "../JsFileRunResult";
import {ChildProcExecutionEnvironment} from "../helpers/ChildProcExecutionEnvironment";
import {spawnChildProc} from "../helpers/spawnChildProc";
import {StdoutCommandsExtractor} from "../../../stdout/StdoutCommandsExtractor";
import {CommandsStore} from "../../../stores/CommandsStore";
import {ActionConfigStoreOptional} from "../../../stores/ActionConfigStore";

export abstract class AbstractJsFileTarget implements SyncRunTargetInterface {
    protected constructor(
        public readonly jsFilePath: string,
        public readonly actionConfig: ActionConfigStoreOptional
    ) {}

    run(options: RunOptions): JsFileRunResult
    {
        const execEnvironment = ChildProcExecutionEnvironment.prepare(this, options.validate());
        const spawnResult = spawnChildProc(this, options, execEnvironment.spawnEnv);
        try {
            const stdoutBuffer = spawnResult.stdout;
            if (stdoutBuffer && options.shouldPrintStdout) {
                process.stdout.write(stdoutBuffer);
            }
            const stdoutStr = stdoutBuffer ? stdoutBuffer.toString() : '';
            const commands = stdoutStr && options.shouldParseStdout
                ? StdoutCommandsExtractor.extract(stdoutStr)
                : new CommandsStore();
            const effects = execEnvironment.getEffects();
            if (options.shouldFakeServiceFiles) {
                commands.addedPaths = effects.addedPaths;
                commands.exportedVars = effects.exportedVars;
            }
            return new JsFileRunResult(
                commands,
                spawnResult.error,
                spawnResult.status !== null ? spawnResult.status : undefined,
                stdoutStr,
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