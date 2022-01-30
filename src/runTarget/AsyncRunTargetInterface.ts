import {RunOptions} from "../runOptions/RunOptions";
import {RunResultInterface} from "../runResult/RunResultInterface";
import {RunTargetInterface} from "./RunTargetInterface";

export interface AsyncRunTargetInterface extends RunTargetInterface {
    run(options: RunOptions): Promise<RunResultInterface>;
    isAsync: true;
}