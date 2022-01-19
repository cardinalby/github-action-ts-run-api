import {AbstractRunResult} from "../runResult/AbstractRunResult";
import {RunOptions} from "../runOptions/RunOptions";

export interface SyncRunTargetInterface {
    run(options: RunOptions): AbstractRunResult;
    clone(): this;
}

