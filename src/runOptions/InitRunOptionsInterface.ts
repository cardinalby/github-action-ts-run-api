import {StringKeyValueObj} from "../types/StringKeyValueObj";
import {EnvInterface} from "../types/EnvInterface";
import {GithubContextInterface} from "../types/GithubContextInterface";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";
import {FakeFileOptionsInterface} from "./FakeFileOptionsInterface";

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
    /** @default {{unsetCommandFilesEnvs: true, fakeCommandFiles: true, fakeTempDir: true, cleanUpTempDir: true}} */
    fakeFileOptions?: Partial<FakeFileOptionsInterface>,
    /** @default {true} */
    shouldParseStdout?: boolean;
    /** @default {false} */
    shouldPrintStdout?: boolean;
    /** @default {undefined} */
    workingDir?: string|undefined;
    /** @default {undefined} */
    timeoutMs?: number|undefined;
}