import {spawnSync} from "child_process";
import {RunOptions} from "../../../runOptions/RunOptions";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";

export function spawnChildProc(
    jsFilePath: string,
    options: RunOptions,
    spawnEnv: StringKeyValueObj
) {
    const resultEnv = {...spawnEnv, PATH: process.env.PATH};
    return spawnSync(
        'node',
        [jsFilePath],
        {
            timeout: options.timeoutMs,
            env: resultEnv,
            cwd: options.workingDir,
            encoding: "utf8"
        });
}