import {SpawnSyncReturns} from "child_process";

export namespace SpawnProc {
    export function printOutput(
        spawnResult: SpawnSyncReturns<any>,
        printStdout: boolean,
        printStderr: boolean
    ) {
        if (printStdout && spawnResult.stdout) {
            process.stdout.write(spawnResult.stdout);
        }
        if (printStderr && spawnResult.stderr) {
            process.stderr.write(spawnResult.stderr);
        }
    }

    export function isTimedOut(spawnResult: SpawnSyncReturns<any>): boolean {
        return !!(spawnResult.error &&
            typeof spawnResult.error === 'object' &&
            (spawnResult.error as any)['code'] &&
            (spawnResult.error as any)['code'] === 'ETIMEDOUT');
    }
}

