import {Warning} from "./Warning";
import os from "os";

export class WarningsArray extends Array<Warning> {
    print(): void {
        this.forEach(warning => process.stderr.write(os.EOL + warning.message))
    }
}