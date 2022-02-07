import {RunResultInterface} from "../../../runResult/RunResultInterface";

export interface FnRunResultInterface<FnResult> extends RunResultInterface {
    /**
     * @description
     * Contains a value returned by a tested function.
     * In case of async fn target, it's a value that promise was fulfilled with.
     */
    readonly fnResult: FnResult|undefined
}