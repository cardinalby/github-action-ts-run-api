import {AbstractRunResult} from "../../../runResult/AbstractRunResult";
import {ParsedCommandsInterface} from "../../../runResult/ParsedCommandsInterface";
import {RunnerDirInterface} from "../../../githubServiceFiles/runnerDir/RunnerDirInterface";
import {SpawnAsyncResult} from "../../../utils/spawnAsync";
import {WarningsArray} from "../../../runResult/warnings/WarningsArray";

export class JsFileRunResult extends AbstractRunResult
{
    constructor(
        commands: ParsedCommandsInterface,
        error: Error|any|undefined,
        exitCode: number|undefined,
        stdout: string|undefined,
        stderr: string|undefined,
        durationMs: number,
        tempDir: RunnerDirInterface,
        workspaceDir: RunnerDirInterface,
        warnings: WarningsArray,
        public readonly spawnResult: SpawnAsyncResult,
    ) {
        super(
            commands,
            error,
            durationMs,
            spawnResult.timedOut,
            exitCode,
            stdout,
            stderr,
            warnings,
            tempDir,
            workspaceDir
        );
    }
}