import {SyncFnTarget} from "../actionRunner/fn/runTarget/SyncFnTarget";
import {AsyncFnTarget} from "../actionRunner/fn/runTarget/AsyncFnTarget";
import {JsFilePathTarget} from "../actionRunner/jsFile/runTarget/JsFilePathTarget";
import {JsActionScriptTarget} from "../actionRunner/jsFile/runTarget/JsActionScriptTarget";
import {DockerTarget} from "../actionRunner/docker/runTarget/DockerTarget";

// noinspection JSUnusedGlobalSymbols
export abstract class RunTarget {
    // Factory methods
    static syncFn = SyncFnTarget.create;
    static asyncFn = AsyncFnTarget.create;
    static jsFile = JsFilePathTarget.create;
    static mainJsScript = JsActionScriptTarget.createMain;
    static preJsScript = JsActionScriptTarget.createPre;
    static postJsScript = JsActionScriptTarget.createPost;
    static docker = DockerTarget.createFromActionYml;
}