import {RunOptions} from "../../../runOptions/RunOptions";
import {AbstractJsFileTarget} from "../runTarget/AbstractJsFileTarget";
import {AbstractExecutionEnvironment} from "../../../executionEnvironment/AbstractExecutionEnvironment";

export class ChildProcExecutionEnvironment extends AbstractExecutionEnvironment {
    static prepare(target: AbstractJsFileTarget, options: RunOptions) {
        return new ChildProcExecutionEnvironment(options, target.actionConfig);
    }
}