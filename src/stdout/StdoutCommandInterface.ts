import {StdoutCommandName} from "./StdoutCommandName";

export interface StdoutCommandInterface {
    command: StdoutCommandName | string,
    properties: { [key: string]: string },
    message: string | undefined
}