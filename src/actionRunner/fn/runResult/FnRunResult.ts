import {AbstractRunResult} from "../../../runResult/AbstractRunResult";
import {CommandsStore} from "../../../runResult/CommandsStore";
import {FnExecutionEffectsInterface} from "../runMilieu/FnExecutionEffectsInterface";
import {FnRunResultInterface} from "./FnRunResultInterface";
import {WarningsArray} from "../../../runResult/warnings/WarningsArray";

export class FnRunResult<R> extends AbstractRunResult implements FnRunResultInterface<R>
{
    // noinspection JSUnusedGlobalSymbols
    constructor(
        public readonly fnResult: R|undefined,
        error: any,
        durationMs: number,
        isTimedOut: boolean,
        executionEffects: FnExecutionEffectsInterface,
        warnings: WarningsArray
    ) {
        super(
            CommandsStore.create(executionEffects.stdoutCommands, executionEffects.fileCommands).data,
            error,
            durationMs,
            isTimedOut,
            executionEffects.exitCode,
            executionEffects.stdout,
            executionEffects.stderr,
            warnings,
            executionEffects.runnerDirs.data.temp,
            executionEffects.runnerDirs.data.workspace
        );
    }
}