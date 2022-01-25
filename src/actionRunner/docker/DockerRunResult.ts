import {AbstractRunResult} from "../../runResult/AbstractRunResult";
import {ParsedCommandsInterface} from "../../runResult/ParsedCommandsInterface";
import {SpawnSyncReturns} from "child_process";
import {OptionalRunnerDirInterface} from "../../githubServiceFiles/runnerDir/RunnerDirInterface";
import {SpawnProc} from "../../utils/spawnProc";

export class DockerRunResult extends AbstractRunResult
{
    constructor(
        commands: ParsedCommandsInterface,
        error: Error|any|undefined,
        exitCode: number|undefined,
        stdout: string|undefined,
        stderr: string|undefined,
        tempDir: OptionalRunnerDirInterface,
        workspaceDir: OptionalRunnerDirInterface,
        public readonly buildSpawnResult: SpawnSyncReturns<string>|undefined,
        public readonly spawnResult: SpawnSyncReturns<string>|undefined,
        public readonly isSuccessBuild: boolean
    ) {
        super(
            commands,
            error,
            spawnResult ? SpawnProc.isTimedOut(spawnResult) : false,
            exitCode,
            stdout,
            stderr,
            tempDir,
            workspaceDir
        );
    }
}