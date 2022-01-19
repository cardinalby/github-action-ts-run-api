import {CommandsStoreInterface} from "../stores/CommandsStoreInterface";

export interface RunResultInterface {
    exitCode: number|undefined;
    commands: CommandsStoreInterface;
    stdout: string;
    error: Error|undefined;
    isTimedOut: boolean;
    isSuccess: boolean;
}