import {ActionConfigStoreOptional} from "../../../stores/ActionConfigStore";

export abstract class AbstractFnTarget<R> {
    protected constructor(
        public readonly fn: () => R,
        public readonly actionConfig: ActionConfigStoreOptional,
    ) {}

    clone(): this {
        return new (<any>this.constructor)(this.fn, this.actionConfig.clone());
    }
}