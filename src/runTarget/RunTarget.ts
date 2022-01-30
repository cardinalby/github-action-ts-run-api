// noinspection JSUnusedGlobalSymbols

import {SyncFnTarget} from "../actionRunner/fn/runTarget/SyncFnTarget";
import {AsyncFnTarget} from "../actionRunner/fn/runTarget/AsyncFnTarget";
import {DockerTarget} from "../actionRunner/docker/runTarget/DockerTarget";
import {JsFileTarget} from "../actionRunner/jsFile/runTarget/JsFileTarget";

/**
 * Read more in docs/run-targets.md
 */
export abstract class RunTarget {
    // Factory methods
    static syncFn = SyncFnTarget.create;
    static asyncFn = AsyncFnTarget.create;
    static jsFile = JsFileTarget.createForFile;
    static mainJs = JsFileTarget.createMain;
    static preJs = JsFileTarget.createPre;
    static postJs = JsFileTarget.createPost;
    static docker = DockerTarget.createFromActionYml;
}