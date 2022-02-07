import {DockerCli} from "../runTarget/dockerCli";
import {SpawnProc} from "../../../utils/spawnProc";
import os from "os";

/**
 * @description
 * Wrapper around callback that runs docker compose file.
 * Performs docker compose up, then runs `callback` function and after its promise fulfilled,
 * runs docker compose down.
 */
export async function withDockerCompose<T>(
    dockerComposeYmlPath: string,
    callback: () => Promise<T>,
    printDebug: boolean = true,
    composeOptions: string[] = []
): Promise<T> {
    const upResult = await DockerCli.composeUp(dockerComposeYmlPath, composeOptions, printDebug);
    if (upResult.status !== 0 || upResult.error) {
        printDebug && SpawnProc.debugError(upResult);
        throw new Error('Error executing docker compose up.');
    }
    try {
        return await callback();
    } finally {
        const downResult = await DockerCli.composeDown(dockerComposeYmlPath, composeOptions, printDebug);
        if (downResult.status !== 0 || downResult.error) {
            printDebug && SpawnProc.debugError(downResult);
            process.stderr.write('Error executing docker compose down.' + os.EOL);
        }
    }
}