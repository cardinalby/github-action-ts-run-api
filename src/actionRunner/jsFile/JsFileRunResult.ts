import {AbstractRunResult} from "../../runResult/AbstractRunResult";
import {ParsedCommandsInterface} from "../../runResult/ParsedCommandsInterface";
import {SpawnSyncReturns} from "child_process";
import {RunnerDirInterface} from "../../githubServiceFiles/runnerDir/RunnerDirInterface";
import {SpawnProc} from "../../utils/spawnProc";

export class JsFileRunResult extends AbstractRunResult
{
    constructor(
        commands: ParsedCommandsInterface,
        error: Error|any|undefined,
        exitCode: number|undefined,
        stdout: string|undefined,
        stderr: string|undefined,
        tempDir: RunnerDirInterface,
        workspaceDir: RunnerDirInterface,
        public readonly spawnResult: SpawnSyncReturns<string>,
    ) {
        super(
            commands,
            error,
            SpawnProc.isTimedOut(spawnResult),
            exitCode,
            stdout,
            stderr,
            tempDir,
            workspaceDir
        );
    }
}