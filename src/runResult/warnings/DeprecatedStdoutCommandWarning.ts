import {Warning} from "./Warning";

export class DeprecatedStdoutCommandWarning extends Warning {
    constructor(
        message: string,
        public readonly command: string
    ) {
        super(message);
    }
}