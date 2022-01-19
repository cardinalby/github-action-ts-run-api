import {AbstractRunResult} from "../runResult/AbstractRunResult";
import {RunOptions} from "../runOptions/RunOptions";

export interface AsyncRunTargetInterface {
    run(options: RunOptions): Promise<AbstractRunResult>;
    clone(): this;
}