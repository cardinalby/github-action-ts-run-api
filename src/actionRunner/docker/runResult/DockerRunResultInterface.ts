import {RunResultInterface} from "../../../runResult/RunResultInterface";
import {SpawnAsyncResult} from "../../../utils/spawnAsync";

export interface DockerRunResultInterface extends RunResultInterface {
    /**
     * @description
     * Contains a result of `docker build` process spawn.
     * After a second and subsequent `run()` calls can be `undefined`, because image id has been cached.
     */
    readonly buildSpawnResult: SpawnAsyncResult|undefined;

    /**
     * @description
     * Contains a result of `docker run` process spawn
     */
    readonly spawnResult: SpawnAsyncResult|undefined;

    /**
     * @description
     * Indicates whether `docker build` command was successful.
     */
    readonly isSuccessBuild: boolean;
}