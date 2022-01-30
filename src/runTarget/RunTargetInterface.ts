import {RunOptions} from "../runOptions/RunOptions";
import {RunResultInterface} from "../runResult/RunResultInterface";
import {ActionConfigStoreOptional} from "../runOptions/ActionConfigStore";

export interface RunTargetInterface {
    run(options: RunOptions): RunResultInterface|Promise<RunResultInterface>;
    isAsync: boolean;
    clone(): this;
    actionYmlPath: string|undefined;
    actionConfig: ActionConfigStoreOptional
}