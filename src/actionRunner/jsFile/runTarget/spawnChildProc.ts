import {RunOptions} from "../../../runOptions/RunOptions";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import {spawnAsync, SpawnAsyncResult} from "../../../utils/spawnAsync";

export async function spawnChildProc(
    jsFilePath: string,
    options: RunOptions,
    spawnEnv: StringKeyValueObj,
    printStdout: boolean,
    printStderr: boolean
): Promise<SpawnAsyncResult> {
    const resultEnv = {...spawnEnv, PATH: process.env.PATH};
    return spawnAsync(
        'node',
        [jsFilePath],
        {
            timeout: options.timeoutMs,
            env: resultEnv,
            cwd: options.workingDir,
            printStdout,
            printStderr
        });
}