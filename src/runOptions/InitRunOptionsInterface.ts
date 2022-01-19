import {StringKeyValueObj} from "../types/StringKeyValueObj";
import {EnvInterface} from "../types/EnvInterface";
import {GithubContextInterface} from "../types/GithubContextInterface";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";

export interface InitRunOptionsInterface {
    /** @default {{}} */
    inputs?: StringKeyValueObj;
    /** @default {{}} */
    context?: StringKeyValueObj;
    /** @default {{}} */
    env?: EnvInterface;
    /** @default {{}} */
    state?: StringKeyValueObj;
    /** @default {{}} */
    githubContext?: GithubContextInterface,
    /** @default {{}} */
    githubServiceEnv?: GithubServiceEnvInterface,
    /** @default {true} */
    shouldFakeServiceFiles?: boolean;
    /** @default {{ fake: true, cleanUp: true }} */
    shouldFakeTempDir?: { fake: boolean, cleanUp: boolean };
    /** @default {true} */
    shouldParseStdout?: boolean;
    /** @default {false} */
    shouldPrintStdout?: boolean;
    /** @default {undefined} */
    workingDir?: string|undefined;
    /** @default {undefined} */
    timeoutMs?: number|undefined;
}