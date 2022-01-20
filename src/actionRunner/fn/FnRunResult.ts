import {AbstractRunResult} from "../../runResult/AbstractRunResult";
import {FnExecutionEffects} from "./executionEnvironment/FnExecutionEnvironment";
import {CommandsStore} from "../../stores/CommandsStore";

export class FnRunResult<R> extends AbstractRunResult
{
    constructor(
        public readonly fnResult: R|undefined,
        error: any,
        isTimedOut: boolean,
        executionEffects: FnExecutionEffects,
    ) {
        super(
            CommandsStore.create(executionEffects.stdoutCommands, executionEffects.fileCommands).data,
            error,
            isTimedOut,
            executionEffects.exitCode,
            executionEffects.stdout,
            executionEffects.tempDir
        );
    }
}