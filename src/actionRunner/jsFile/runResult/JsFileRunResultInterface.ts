import {RunResultInterface} from "../../../runResult/RunResultInterface";
import {SpawnAsyncResult} from "../../../utils/spawnAsync";

export interface JsFileRunResultInterface extends RunResultInterface {
    /**
     * @description
     * Contains a result of a spawning of child node process
     */
    readonly spawnResult: SpawnAsyncResult;
}