import {ActionConfigWarning} from "./RunnerWarning";

export class DeprecatedNodeVersionWarning extends ActionConfigWarning {
    constructor(
        message: string,
        public readonly version: string
    ) {
        super(message);
    }
}