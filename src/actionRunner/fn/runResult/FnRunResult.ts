import {AbstractRunResult} from "../../../runResult/AbstractRunResult";
import {CommandsStore} from "../../../runResult/CommandsStore";
import {FnExecutionEffectsInterface} from "../runMilieu/FnExecutionEffectsInterface";
import {FnRunResultInterface} from "./FnRunResultInterface";
import {RunnerWarning} from "../../../runResult/warnings/RunnerWarning";

export class FnRunResult<R> extends AbstractRunResult implements FnRunResultInterface<R>
{
    // noinspection JSUnusedGlobalSymbols
    constructor(
        public readonly fnResult: R|undefined,
        error: any,
        durationMs: number,
        isTimedOut: boolean,
        executionEffects: FnExecutionEffectsInterface,
        runnerWarnings: RunnerWarning[]
    ) {
        super(
            CommandsStore.create(executionEffects.stdoutCommands, executionEffects.fileCommands).data,
            error,
            durationMs,
            isTimedOut,
            executionEffects.exitCode,
            executionEffects.stdout,
            executionEffects.stderr,
            runnerWarnings,
            executionEffects.runnerDirs.data.temp,
            executionEffects.runnerDirs.data.workspace
        );
    }
}