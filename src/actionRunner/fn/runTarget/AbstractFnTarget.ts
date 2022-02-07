import {ActionConfigStoreOptional} from "../../../runOptions/ActionConfigStore";
import {FnRunMilieu} from "../runMilieu/FnRunMilieu";
import {FnRunMilieuFactory} from "../runMilieu/FnRunMilieuFactory";
import {BaseRunMilieuComponentsFactory} from "../../../runMilieu/BaseRunMilieuComponentsFactory";
import {RunOptions} from "../../../runOptions/RunOptions";

export abstract class AbstractFnTarget<R> {
    protected constructor(
        public readonly fn: () => R,
        public readonly actionConfig: ActionConfigStoreOptional,
        public readonly actionYmlPath: string|undefined
    ) {}

    abstract clone(): this;

    protected createMilieu(options: RunOptions): FnRunMilieu {
        return (new FnRunMilieuFactory(
            new BaseRunMilieuComponentsFactory(options, this.actionConfig)
        )).createMilieu(options.validate());
    }
}