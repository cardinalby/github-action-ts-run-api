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
    env?: EnvInterface;
    /** @default {{}} */
    state?: StringKeyValueObj;
    /** @default {{}} */
    githubContext?: GithubContextInterface,
    /** @default {{}} */
    githubServiceEnv?: GithubServiceEnvInterface,
    /** @default {{tmpRootDir: undefined, fakeCommandFiles: true, rmFakedTempDirAfterRub: true, rmFakedWorkspaceDirAfterRun: true}} */
    fakeFsOptions?: Partial<FakeFsOptionsInterface>,
    /** @default {{parseStdoutCommands: true, printStderr: true, printStdout: true, stdoutTransform: undefined, printRunnerDebug: false }} */
    outputOptions?: Partial<OutputOptionsInterface>,
    /**
     * true: add process.env of the current process to target's env
     * false: do not add
     * undefined: do not add, except JS file target if debugger is attached (to enable you debugging a child proc)
     * @default {undefined}
     **/
    shouldAddProcessEnv?: boolean|undefined;
    /** @default {true} */
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