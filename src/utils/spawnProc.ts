import {SpawnSyncReturns} from "child_process";
import os from "os";

export namespace SpawnProc {
    export function debugError(spawnRes: SpawnSyncReturns<string>) {
        if (spawnRes.error) {
            process.stderr.write(spawnRes.error.toString() + os.EOL);
        }
        if (spawnRes.status !== null && spawnRes.status !== 0) {
            process.stderr.write(`Finished with status = ${spawnRes.status}, ${spawnRes.stderr}` + os.EOL);
        }
    }
}

