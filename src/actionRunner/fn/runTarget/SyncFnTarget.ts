import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import {AbstractFnTarget} from "./AbstractFnTarget";
import {FnRunResult} from "../FnRunResult";
import {RunOptions} from "../../../runOptions/RunOptions";
import {FnExecutionEnvironment} from "../executionEnvironment/FnExecutionEnvironment";
import {runSyncFn} from "./runFn";
import {SyncRunTargetInterface} from "../../../runTarget/SyncRunTargetInterface";
import {ActionConfigSource, ActionConfigStore} from "../../../stores/ActionConfigStore";

export class SyncFnTarget<R> extends AbstractFnTarget<R> implements SyncRunTargetInterface {
    static create<R>(fn: () => R, actionConfig?: ActionConfigInterface): SyncFnTarget<R>;
    static create<R>(fn: () => R, actionYmlPath?: string): SyncFnTarget<R>;
    static create<R>(fn: () => R, actionConfigSrc?: ActionConfigSource): SyncFnTarget<R> {
        return new SyncFnTarget(fn, ActionConfigStore.create(actionConfigSrc, false));
    }

    run(options: RunOptions): FnRunResult<R>
    {
        const execEnvironment = FnExecutionEnvironment.prepare(this, options.validate());
        const {fnResult, error, timedOut} = runSyncFn(this.fn, options.timeoutMs);
        try {
            const effects = execEnvironment.getEffects();
            return new FnRunResult(fnResult, error, timedOut, effects);
        } finally {
            execEnvironment.restore();
        }
    }
}