import {RunOptions} from "../../../runOptions/RunOptions";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import {spawnAsync, SpawnAsyncResult} from "../../../utils/spawnAsync";
import {OutputTransform} from "../../../runOptions/OutputTransform";

export async function spawnChildProc(
    jsFilePath: string,
    options: RunOptions,
    spawnEnv: StringKeyValueObj,
    printStdout: boolean,
    stdoutTransform: OutputTransform,
    printStderr: boolean,
    stderrTransform: OutputTransform
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
            stdoutTransform,
            printStderr,
            stderrTransform
        });
}