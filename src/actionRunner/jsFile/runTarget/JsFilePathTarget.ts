import {AbstractJsFileTarget} from "./AbstractJsFileTarget";
import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import {
    ActionConfigSource,
    ActionConfigStore,
    ActionConfigStoreOptional
} from "../../../stores/ActionConfigStore";

export class JsFilePathTarget extends AbstractJsFileTarget {
    // noinspection JSUnusedGlobalSymbols
    static create(jsFilePath: string, actionConfig?: ActionConfigInterface): AbstractJsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static create(jsFilePath: string, actionYmlPath?: string): AbstractJsFileTarget;
    // noinspection JSUnusedGlobalSymbols
    static create(jsFilePath: string, actionConfigSource?: ActionConfigSource): AbstractJsFileTarget {
        const actionConfig = ActionConfigStore.create(actionConfigSource, false);
        return new JsFilePathTarget(
            jsFilePath,
            actionConfig,
            typeof actionConfigSource === 'string' ? actionConfigSource : undefined
        );
    }

    protected constructor(
        jsFilePath: string,
        actionConfig: ActionConfigStoreOptional,
        actionYmlPath: string|undefined
    ) {
        super(jsFilePath, actionConfig, actionYmlPath);
    }
}