import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import {AbstractFnTarget} from "./AbstractFnTarget";
import {FnRunResult} from "../runResult/FnRunResult";
import {RunOptions} from "../../../runOptions/RunOptions";
import {runAsyncFn} from "./runFn";
import {AsyncRunTargetInterface} from "../../../runTarget/AsyncRunTargetInterface";
import {ActionConfigSource, ActionConfigStore} from "../../../runOptions/ActionConfigStore";
import {FnRunResultInterface} from "../runResult/FnRunResultInterface";
import os from "os";
import {WarningsCollector} from "../../../runResult/warnings/WarningsCollector";

export class AsyncFnTarget<R> extends AbstractFnTarget<Promise<R>> implements AsyncRunTargetInterface {
    static create<R>(fn: () => Promise<R>, actionConfig?: ActionConfigInterface): AsyncFnTarget<R>;
    static create<R>(fn: () => Promise<R>, actionYmlPath?: string): AsyncFnTarget<R>;
    static create<R>(fn: () => Promise<R>, actionConfigSrc?: ActionConfigSource): AsyncFnTarget<R> {
        return new AsyncFnTarget(
            fn,
            ActionConfigStore.create(actionConfigSrc, false),
            typeof actionConfigSrc === 'string' ? actionConfigSrc : undefined
        );
    }

    public isAsync: true = true;

    async run(options: RunOptions): Promise<FnRunResultInterface<R>> {
        const runMilieu = this.createMilieu(options.validate());
        const {fnResult, error, timedOut, durationMs} = await runAsyncFn(this.fn, options.timeoutMs);
        const warningsCollector = (new WarningsCollector(options, this.actionConfig))
            .setCommandWarnings(runMilieu.stdoutInterceptor.parserWarnings)
        try {
            const effects = runMilieu.getEffects();
            if (options.outputOptions.data.printRunnerDebug) {
                process.stdout.write(`Finished with status code = ${effects.exitCode}` + os.EOL);
            }
            return new FnRunResult<R>(
                fnResult, error, durationMs, timedOut, effects, warningsCollector.get()
            );
        } finally {
            runMilieu.restore();
            warningsCollector.print()
        }
    }

    clone(): this {
        return (new AsyncFnTarget(this.fn, this.actionConfig.clone(), this.actionYmlPath)) as this;
    }
}