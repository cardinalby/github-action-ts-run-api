import * as inspector from "inspector";
import {BaseRunMilieuComponentsFactory} from "../../../runMilieu/BaseRunMilieuComponentsFactory";
import {EnvStore} from "../../../runOptions/EnvStore";

export class ChildProcRunMilieuComponentsFactory extends BaseRunMilieuComponentsFactory {
    addProcessEnvToEnv(envStore: EnvStore) {
        if (this.options.shouldAddProcessEnv ||
            (this.options.shouldAddProcessEnv === undefined && inspector.url() !== undefined)
        ) {
            envStore.apply(process.env);
        }
    }
}