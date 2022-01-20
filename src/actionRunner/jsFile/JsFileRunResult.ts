import {AbstractRunResult} from "../../runResult/AbstractRunResult";
import {ParsedCommandsInterface} from "../../stores/ParsedCommandsInterface";
import {SpawnSyncReturns} from "child_process";
import {FakeTempDir} from "../../githubServiceFiles/FakeTempDir";

export class JsFileRunResult extends AbstractRunResult
{
    constructor(
        commands: ParsedCommandsInterface,
        error: Error|any|undefined,
        exitCode: number|undefined,
        stdout: string,
        tempDir: FakeTempDir|undefined,
        public readonly spawnResult: SpawnSyncReturns<Buffer>,
    ) {
        super(
            commands,
            error,
            JsFileRunResult.isTimedOut(spawnResult),
            exitCode,
            stdout,
            tempDir
        );
    }

    private static isTimedOut(spawnResult: SpawnSyncReturns<Buffer>): boolean {
        return !!(spawnResult.error &&
            typeof spawnResult.error === 'object' &&
            (spawnResult.error as any)['code'] &&
            (spawnResult.error as any)['code'] === 'ETIMEDOUT');
    }
}