import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import {AbstractFnTarget} from "./AbstractFnTarget";
import {FnRunResult} from "../FnRunResult";
import {RunOptions} from "../../../runOptions/RunOptions";
import {FnExecutionEnvironment} from "../executionEnvironment/FnExecutionEnvironment";
import {runAsyncFn} from "./runFn";
import {AsyncRunTargetInterface} from "../../../runTarget/AsyncRunTargetInterface";
import {ActionConfigSource, ActionConfigStore} from "../../../stores/ActionConfigStore";

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

    async run(options: RunOptions): Promise<FnRunResult<R>> {
        const execEnvironment = FnExecutionEnvironment.prepare(this, options.validate());
        const {fnResult, error, timedOut} = await runAsyncFn(this.fn, options.timeoutMs);
        try {
            const effects = execEnvironment.getEffects();
            return new FnRunResult<R>(fnResult, error, timedOut, effects);
        } finally {
            execEnvironment.restore();
        }
    }
}