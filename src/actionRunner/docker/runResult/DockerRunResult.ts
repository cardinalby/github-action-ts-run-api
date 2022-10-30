import {AbstractRunResult} from "../../../runResult/AbstractRunResult";
import {ParsedCommandsInterface} from "../../../runResult/ParsedCommandsInterface";
import {OptionalRunnerDirInterface} from "../../../githubServiceFiles/runnerDir/RunnerDirInterface";
import {SpawnAsyncResult} from "../../../utils/spawnAsync";
import {DockerRunResultInterface} from "./DockerRunResultInterface";
import {WarningsArray} from "../../../runResult/warnings/WarningsArray";

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
        warnings: WarningsArray,
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
            warnings,
            tempDir,
            workspaceDir
        );
    }
}