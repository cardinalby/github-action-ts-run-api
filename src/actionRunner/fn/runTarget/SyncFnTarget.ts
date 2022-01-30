import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import {AbstractFnTarget} from "./AbstractFnTarget";
import {FnRunResult} from "../FnRunResult";
import {RunOptions} from "../../../runOptions/RunOptions";
import {runSyncFn} from "./runFn";
import {SyncRunTargetInterface} from "../../../runTarget/SyncRunTargetInterface";
import {ActionConfigSource, ActionConfigStore} from "../../../runOptions/ActionConfigStore";

export class SyncFnTarget<R> extends AbstractFnTarget<R> implements SyncRunTargetInterface {
    static create<R>(fn: () => R, actionConfig?: ActionConfigInterface): SyncFnTarget<R>;
    static create<R>(fn: () => R, actionYmlPath?: string): SyncFnTarget<R>;
    static create<R>(fn: () => R, actionConfigSrc?: ActionConfigSource): SyncFnTarget<R> {
        return new SyncFnTarget(
            fn,
            ActionConfigStore.create(actionConfigSrc, false),
            typeof actionConfigSrc === 'string' ? actionConfigSrc : undefined
        );
    }

    public isAsync: false = false;

    run(options: RunOptions): FnRunResult<R>
    {
        const runMilieu = this.createMilieu(options.validate());
        const {fnResult, error, timedOut, durationMs} = runSyncFn(this.fn, options.timeoutMs);
        try {
            const effects = runMilieu.getEffects(options.outputOptions.data.parseStdoutCommands);
            return new FnRunResult(fnResult, error, durationMs, timedOut, effects);
        } finally {
            runMilieu.restore();
        }
    }

    clone(): this {
        return (new SyncFnTarget(this.fn, this.actionConfig.clone(), this.actionYmlPath)) as this;
    }
}