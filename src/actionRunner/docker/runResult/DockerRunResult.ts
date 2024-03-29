import {AbstractRunResult} from "../../../runResult/AbstractRunResult";
import {ParsedCommandsInterface} from "../../../runResult/ParsedCommandsInterface";
import {OptionalRunnerDirInterface} from "../../../githubServiceFiles/runnerDir/RunnerDirInterface";
import {SpawnAsyncResult} from "../../../utils/spawnAsync";
import {DockerRunResultInterface} from "./DockerRunResultInterface";
import {RunnerWarning} from "../../../runResult/warnings/RunnerWarning";

export class DockerRunResult extends AbstractRunResult implements DockerRunResultInterface
{
    constructor(
        commands: ParsedCommandsInterface,
        error: Error|any|undefined,
        exitCode: number|undefined,
        stdout: string|undefined,
        stderr: string|undefined,
        durationMs: number,
        tempDir: OptionalRunnerDirInterface,
        workspaceDir: OptionalRunnerDirInterface,
        runnerWarnings: RunnerWarning[],
        public readonly buildSpawnResult: SpawnAsyncResult|undefined,
        public readonly spawnResult: SpawnAsyncResult|undefined,
        public readonly isSuccessBuild: boolean
    ) {
        super(
            commands,
            error,
            durationMs,
            spawnResult ? spawnResult.timedOut : false,
            exitCode,
            stdout,
            stderr,
            runnerWarnings,
            tempDir,
            workspaceDir
        );
    }
}