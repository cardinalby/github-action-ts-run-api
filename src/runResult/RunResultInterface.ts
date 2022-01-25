import {ParsedCommandsInterface} from "./ParsedCommandsInterface";

export interface RunResultInterface {
    readonly exitCode: number|undefined;
    readonly commands: ParsedCommandsInterface;
    readonly stdout: string|undefined;
    readonly stderr: string|undefined;
    readonly error: Error|undefined;
    readonly isTimedOut: boolean;
    readonly isSuccess: boolean;
    readonly tempDirPath: string|undefined;
    readonly workspaceDirPath: string|undefined;

    cleanUpFakedDirs(): this;
}