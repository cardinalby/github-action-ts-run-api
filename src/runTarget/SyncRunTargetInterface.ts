import {RunOptions} from "../runOptions/RunOptions";
import {ActionConfigStoreOptional} from "../runOptions/ActionConfigStore";
import {RunResultInterface} from "../runResult/RunResultInterface";
import {RunTargetInterface} from "./RunTargetInterface";

export interface SyncRunTargetInterface extends RunTargetInterface {
    run(options: RunOptions): RunResultInterface;
    isAsync: false;
    clone(): this;
    actionYmlPath: string|undefined;
    actionConfig: ActionConfigStoreOptional
}

