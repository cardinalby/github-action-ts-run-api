import {StringKeyValueObj} from "../types/StringKeyValueObj";
import {EnvInterface} from "../types/EnvInterface";
import {GithubContextInterface} from "../types/GithubContextInterface";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";
import {FakeFsOptionsInterface} from "./FakeFsOptionsInterface";
import {OutputOptionsInterface} from "./OutputOptionsInterface";

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
    /** @default {{tmpRootDir: undefined, fakeCommandFiles: true, rmFakedTempDirAfterRub: true, rmFakedWorkspaceDirAfterRun: true}} */
    fakeFsOptions?: Partial<FakeFsOptionsInterface>,
    /** @default {{parseStdoutCommands: true, printStderr: true, printStdout: undefined, printRunnerDebug: false }} */
    outputOptions?: Partial<OutputOptionsInterface>,
    /** @default {false} */
    shouldFakeMinimalGithubRunnerEnv?: boolean;
    /** @default {undefined} */
    workingDir?: string|undefined;
    /** @default {undefined} */
    workspaceDir?: string|undefined;
    /** @default {undefined} */
    tempDir?: string|undefined;
    /** @default {undefined} */
    timeoutMs?: number|undefined;
}