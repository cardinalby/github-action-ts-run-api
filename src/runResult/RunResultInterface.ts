import {ParsedCommandsInterface} from "../stores/ParsedCommandsInterface";

export interface RunResultInterface {
    exitCode: number|undefined;
    commands: ParsedCommandsInterface;
    stdout: string;
    error: Error|undefined;
    isTimedOut: boolean;
    isSuccess: boolean;
}