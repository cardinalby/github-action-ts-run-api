import {AbstractRunResult} from "../../runResult/AbstractRunResult";
import {CommandsStore} from "../../runResult/CommandsStore";
import {FnExecutionEffectsInterface} from "./runMilieu/FnExecutionEffectsInterface";

export class FnRunResult<R> extends AbstractRunResult
{
    constructor(
        public readonly fnResult: R|undefined,
        error: any,
        isTimedOut: boolean,
        executionEffects: FnExecutionEffectsInterface,
    ) {
        super(
            CommandsStore.create(executionEffects.stdoutCommands, executionEffects.fileCommands).data,
            error,
            isTimedOut,
            executionEffects.exitCode,
            executionEffects.stdout,
            executionEffects.stderr,
            executionEffects.runnerDirs.data.temp,
            executionEffects.runnerDirs.data.workspace
        );
    }
}