import {AbstractJsFileTarget} from "./AbstractJsFileTarget";
import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import path from "path";
import assert from "assert";
import {ActionConfigSource, ActionConfigStore, ActionConfigStoreFilled} from "../../../stores/ActionConfigStore";

type ScriptName = 'pre'|'main'|'post';

export class JsActionScriptTarget extends AbstractJsFileTarget {
    // noinspection JSUnusedGlobalSymbols
    static createMain(actionConfig: ActionConfigInterface, filePathPrefix: string): AbstractJsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createMain(actionYmlPath: string): AbstractJsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createMain(actionConfigSource: ActionConfigSource, filePathPrefix?: string): AbstractJsFileTarget {
        return JsActionScriptTarget.createFromConfigRunsKey('main', actionConfigSource, filePathPrefix);
    }

    // noinspection JSUnusedGlobalSymbols
    static createPre(actionConfig: ActionConfigInterface, filePathPrefix: string): AbstractJsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createPre(actionYmlPath: string): AbstractJsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createPre(actionConfigSource: ActionConfigSource, filePathPrefix?: string): AbstractJsFileTarget {
        return JsActionScriptTarget.createFromConfigRunsKey('pre', actionConfigSource, filePathPrefix);
    }

    // noinspection JSUnusedGlobalSymbols
    static createPost(actionConfig: ActionConfigInterface, filePathPrefix: string): AbstractJsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createPost(actionYmlPath: string): AbstractJsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static createPost(actionConfigSource: ActionConfigSource, filePathPrefix?: string): AbstractJsFileTarget {
        return JsActionScriptTarget.createFromConfigRunsKey('post', actionConfigSource, filePathPrefix);
    }

    protected static createFromConfigRunsKey(
        scriptName: ScriptName,
        actionConfigSource: ActionConfigSource,
        filePathPrefix?: string
    ): AbstractJsFileTarget {
        const actionConfig = ActionConfigStore.create(actionConfigSource, true);
        assert(actionConfig.data.runs.using.startsWith('node'), "Passed action config is not runs using node");
        let targetFilePath = actionConfig.data.runs[scriptName];
        assert(targetFilePath !== undefined, `Action config doesn't have "${scriptName}" key in "runs" section`);
        if (filePathPrefix === undefined) {
            assert(typeof actionConfigSource === 'string');
            filePathPrefix = path.dirname(actionConfigSource);
        }
        targetFilePath = path.resolve(filePathPrefix, targetFilePath);
        return new JsActionScriptTarget(
            targetFilePath,
            actionConfig,
            typeof actionConfigSource === 'string' ? actionConfigSource : undefined
        );
    }

    protected constructor(
        jsFilePath: string,
        actionConfig: ActionConfigStoreFilled,
        actionYmlPath: string|undefined
    ) {
        super(jsFilePath, actionConfig, actionYmlPath);
    }
}