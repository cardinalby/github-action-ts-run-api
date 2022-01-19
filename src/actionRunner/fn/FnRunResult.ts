import {AbstractRunResult} from "../../runResult/AbstractRunResult";
import {ExecutionEffects} from "./helpers/FnExecutionEnvironment";

export class FnRunResult<R> extends AbstractRunResult
{
    constructor(
        public readonly fnResult: R|undefined,
        error: any,
        isTimedOut: boolean,
        executionEffects: ExecutionEffects,
    ) {
        super(
            executionEffects.commands,
            error,
            isTimedOut,
            executionEffects.exitCode,
            executionEffects.stdout,
            executionEffects.tempDir
        );
    }
}