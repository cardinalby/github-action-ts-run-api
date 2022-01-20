import {spawnSync} from "child_process";
import {AbstractJsFileTarget} from "./AbstractJsFileTarget";
import {RunOptions} from "../../../runOptions/RunOptions";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";

export function spawnChildProc(
    target: AbstractJsFileTarget,
    options: RunOptions,
    spawnEnv: StringKeyValueObj
) {
    return spawnSync(
        'node',
        [target.jsFilePath],
        {
            timeout: options.timeoutMs,
            env: spawnEnv,
            cwd: options.workingDir,
            encoding: "utf8"
        });
}