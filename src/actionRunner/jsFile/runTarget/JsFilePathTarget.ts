import {AbstractJsFileTarget} from "./AbstractJsFileTarget";
import {ActionConfigInterface} from "../../../types/ActionConfigInterface";
import {
    ActionConfigSource,
    ActionConfigStore,
    ActionConfigStoreOptional
} from "../../../runOptions/ActionConfigStore";

export class JsFilePathTarget extends AbstractJsFileTarget<ActionConfigInterface|undefined> {
    // noinspection JSUnusedGlobalSymbols
    static create(jsFilePath: string, actionConfig?: ActionConfigInterface): JsFilePathTarget;
    // noinspection JSUnusedGlobalSymbols
    static create(jsFilePath: string, actionYmlPath?: string): JsFilePathTarget;
    // noinspection JSUnusedGlobalSymbols
    static create(jsFilePath: string, actionConfigSource?: ActionConfigSource): JsFilePathTarget {
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

    clone(): this {
        return new JsFilePathTarget(
            this.jsFilePath,
            this.actionConfig.clone(),
            this.actionYmlPath
        ) as this;
    }
}