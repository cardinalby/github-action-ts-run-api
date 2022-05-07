import {RunOptions} from "../../../runOptions/RunOptions";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import {spawnAsync, SpawnAsyncResult} from "../../../utils/spawnAsync";
import {OutputTransform} from "../../../runOptions/OutputTransform";
import {OutputsCommandsCollector} from "../../../stdout/OutputsCommandsCollector";

export async function spawnChildProc(
    jsFilePath: string,
    options: RunOptions,
    spawnEnv: StringKeyValueObj,
    printStdout: boolean,
    stdoutTransform: OutputTransform,
    printStderr: boolean,
    stderrTransform: OutputTransform,
    commandsCollector: OutputsCommandsCollector
): Promise<SpawnAsyncResult> {
    const resultEnv = {...spawnEnv, PATH: process.env.PATH};
    const res = await spawnAsync(
        'node',
        [jsFilePath],
        {
            timeout: options.timeoutMs,
            env: resultEnv,
            cwd: options.workingDir,
            printStdout,
            stdoutTransform,
            printStderr,
            stderrTransform,
            onSpawn: child => {
                if (commandsCollector.stdoutParsingStream) {
                    child.stdout.pipe(commandsCollector.stdoutParsingStream)
                }
                if (commandsCollector.stderrParsingStream) {
                    child.stderr.pipe(commandsCollector.stderrParsingStream)
                }
            }
        });
    await commandsCollector.waitUntilStreamsAreClosed();
    return res;
}