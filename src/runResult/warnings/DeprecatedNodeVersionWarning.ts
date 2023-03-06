import {Warning} from "./Warning";

export class DeprecatedNodeVersionWarning extends Warning {
    constructor(
        message: string,
        public readonly version: string
    ) {
        super(message);
    }
}