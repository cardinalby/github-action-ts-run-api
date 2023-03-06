import {EnvStore} from "./EnvStore";
import {InputsStore} from "./InputsStore";
import {StateStore} from "./StateStore";
import {StringKeyValueObj} from "../types/StringKeyValueObj";
import {EnvInterface} from "../types/EnvInterface";
import {GithubContextStore} from "./GithubContextStore";
import {GithubServiceEnvStore} from "./GithubServiceEnvStore";
import {GithubContextInterface} from "../types/GithubContextInterface";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";
import {InitRunOptionsInterface} from "./InitRunOptionsInterface";
import {FakeFsOptionsStore} from "./FakeFsOptionsStore";
import {FakeFsOptionsInterface} from "./FakeFsOptionsInterface";
import {OutputOptionsInterface} from "./OutputOptionsInterface";
import {OutputOptionsStore} from "./OutputOptionsStore";

/**
 * Read more in docs/run-options.md
 */
export class RunOptions
{
    static create(init: InitRunOptionsInterface = {}): RunOptions {
        const defaultFakeFsOptions: FakeFsOptionsInterface = {
            tmpRootDir: undefined,
            fakeCommandFiles: true,
            rmFakedTempDirAfterRun: true,
            rmFakedWorkspaceDirAfterRun: true
        }
        const defaultOutputHandlingOptions: OutputOptionsInterface = {
            parseStdoutCommands: true,
            parseStderrCommands: true,
            printStderr: true,
            printStdout: true,
            stdoutTransform: undefined,
            stderrTransform: undefined,
            printRunnerDebug: false,
            printRunnerWarnings: true
        }
        return new RunOptions(
            new InputsStore(init.inputs || {}),
            new EnvStore(init.env || {}),
            new StateStore(init.state || {}),
            new GithubContextStore(init.githubContext || {}),
            new GithubServiceEnvStore(init.githubServiceEnv || {}),
            (new FakeFsOptionsStore(defaultFakeFsOptions)).apply(init.fakeFsOptions || {}),
            (new OutputOptionsStore(defaultOutputHandlingOptions)).apply(init.outputOptions || {}),
            init.shouldAddProcessEnv,
            init.shouldFakeMinimalGithubRunnerEnv !== undefined ? init.shouldFakeMinimalGithubRunnerEnv : true,
            init.workingDir,
            init.workspaceDir,
            init.tempDir,
            init.timeoutMs
        );
    }

    protected constructor(
        public readonly inputs: InputsStore,
        public readonly env: EnvStore,
        public readonly state: StateStore,
        public readonly githubContext: GithubContextStore,
        public readonly githubServiceEnv: GithubServiceEnvStore,
        public readonly fakeFsOptions: FakeFsOptionsStore,
        public readonly outputOptions: OutputOptionsStore,
        public shouldAddProcessEnv: boolean|undefined,
        public shouldFakeMinimalGithubRunnerEnv: boolean,
        public workingDir: string|undefined,
        public workspaceDir: string|undefined,
        public tempDir: string|undefined,
        public timeoutMs: number|undefined,
    ) {}

    /**
     * @description Specify a set of string environment variables
     * (https://docs.github.com/en/actions/learn-github-actions/environment-variables) that will be
     * set for action run.
     * It's an analog of `env` section in a workflow. Doesn't override `setGithubContext()` and `setGithubServiceEnv()`
     * in options object, but will be merged with other service env variables at action run.
     */
    setEnv(env: EnvInterface, update: boolean = true): this {
        update ? this.env.apply(env) : this.env.setData(env);
        return this;
    }

    /**
     * @description
     * `true`: add current process env variables to action env
     * `false`: do not add
     * _default_ `undefined`: do not add, except the case of JS file target if debugger is attached
     * (to enable you debugging a child proc).
     *
     * Doesn't override env variables in options object, but will be merged with all service env variables at
     * action run.
     */
    setShouldAddProcessEnv(shouldAdd: boolean|undefined): this {
        this.shouldAddProcessEnv = shouldAdd;
        return this;
    }

    /**
     * @description
     * Set or update options related to faking dirs and files for an action. Receives an object with
     * optional properties if you want to update only some properties.
     */
    setFakeFsOptions(options: FakeFsOptionsInterface, update: false): this;
    setFakeFsOptions(options: Partial<FakeFsOptionsInterface>, update?: true): this;
    setFakeFsOptions(options: FakeFsOptionsInterface, update: boolean = true): this {
        update ? this.fakeFsOptions.apply(options) : this.fakeFsOptions.setData(options);
        return this;
    }

    /**
     * @description Specify a set of string inputs that will be mapped to the correspondent `INPUT_` env variables at the time
     * of action execution. It's an analog of `with` section in a workflow.
     * If your want to have default input values from `action.yml`, pass its path to the target factory.
     */
    setInputs(inputsUpdate: StringKeyValueObj, update: boolean = true): this {
        update ? this.inputs.apply(inputsUpdate) : this.inputs.setData(inputsUpdate);
        return this;
    }

    /**
     * @description Specify a set of
     * saved state
     * (https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#sending-values-to-the-pre-and-post-actions)
     * values that will be mapped to `STATE_` env variables at action run.
     *
     * Can be used to pass values from `result.commands.savedState` of _main_ script run to `post` scripts run.
     */
    setState(state: StringKeyValueObj, update: boolean = true): this {
        update ? this.state.apply(state) : this.state.setData(state);
        return this;
    }

    /**
     * @description
     * Specify properties of GitHub context
     * (https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts)
     * that will be mapped to corresponding env variables.
     * In an action it's normally accessible by `require('@actions/github').context`.
     *
     * Doesn't override `setEnv()` in options object, but will be merged with other service env variables at action run.
     *
     * If you set a `payload` property, at action run it will be serialized to a temp file, its path will be set to
     * `GITHUB_EVENT_PATH` env variable, so that `@actions/github` context can read it correctly.
     * @see GithubContextEnvsInterface
     */
    setGithubContext(context: GithubContextInterface, update: boolean = true): this {
        update ? this.githubContext.apply(context) : this.githubContext.setData(context);
        return this;
    }

    /**
     * @description
     * Set or modify action output handling options. Receives an object with optional properties for update or
     * all properties to replace
     */
    setOutputOptions(options: OutputOptionsInterface, update: false): this;
    setOutputOptions(options: Partial<OutputOptionsInterface>, update?: true): this;
    setOutputOptions(options: OutputOptionsInterface, update: boolean = true): this {
        update ? this.outputOptions.apply(options) : this.outputOptions.setData(options);
        return this;
    }

    /**
     * @description
     * `false`: do not set any default values<br>
     * `true` _(default)_: emulate GitHub runner environment as possible by faking GitHub service and context envs.<br>
     *
     * The following env variables will be set:
     *
     * | Env variable       | Value                                           |
     * |--------------------|-------------------------------------------------|
     * | GITHUB_WORKFLOW    | test_workflow                                   |
     * | GITHUB_RUN_ID      | _random number_                                 |
     * | GITHUB_RUN_NUMBER  | 1                                               |
     * | GITHUB_JOB         | test_job                                        |
     * | GITHUB_ACTION      | _name from `action.yml` file, if set in target_ |
     * | GITHUB_ACTOR       | tester                                          |
     * | GITHUB_EVENT_NAME  | workflow_dispatch                               |
     * | GITHUB_SERVER_URL  | https://github.com                              |
     * | GITHUB_API_URL     | https://api.github.com                          |
     * | GITHUB_GRAPHQL_URL | https://api.github.com/graphql                  |
     * | CI                 | true                                            |
     * | GITHUB_ACTIONS     | true                                            |
     * | RUNNER_NAME        | test-runner                                     |
     * | RUNNER_OS          | _os, taken from the host_                       |
     * | RUNNER_ARCH        | _arch, taken from the host_                     |
     *
     *  If set to `true`, it doesn't override env variables in options object, but will be merged at action run.
     *  Explicitly set variables will have higher priority during the merge.
     */
    setShouldFakeMinimalGithubRunnerEnv(doFake: boolean): this {
        this.shouldFakeMinimalGithubRunnerEnv = doFake;
        return this;
    }

    /**
     * A separate method (for convenience) to set GitHub service env variables.
     * Doesn't override `setEnv()` in options object, but will be merged with other service env variables at action run.
     */
    setGithubServiceEnv(githubEnv: GithubServiceEnvInterface, update: boolean = true): this {
        update ? this.githubServiceEnv.apply(githubEnv) : this.githubServiceEnv.setData(githubEnv);
        return this;
    }

    /**
     * @description
     * Set a working dir path for an action. If you run Docker action, it should point to the path
     * inside container.
     *
     * Default:
     * - For JavaScript actions: working dir of a current process
     * - For Docker actions: `/github/workspace`
     */
    setWorkingDir(dirPath: string|undefined): this {
        this.workingDir = dirPath;
        return this;
    }

    /**
     * @description
     * Set path of an existing dir to `GITHUB_WORKSPACE` env variable. If you run
     * a docker action, it will be mounted as volume to `/github/workspace` and `GITHUB_WORKSPACE` will
     * point to it.
     *
     * `undefined` _(default)_: create a temporary dir that will be deleted after run. To prevent
     * it from deleting, use `setFakeFsOptions({rmFakedWorkspaceDirAfterRun: false})`.
     */
    setWorkspaceDir(dirPath: string|undefined): this {
        this.workspaceDir = dirPath;
        return this;
    }

    /**
     * @default
     * Set path of an existing dir to `RUNNER_TEMP` env variable. If you run
     * a docker action, it will be mounted as volume to `/home/runner/work/_temp` and `RUNNER_TEMP` will
     * point to it.
     *
     * `undefined` _(default)_: create a temporary dir that will be deleted after run. To prevent
     * it from deleting, use `setFakeFsOptions({rmFakedTempDirAfterRun: false})`.
     */
    setTempDir(dirPath: string|undefined): this {
        this.tempDir = dirPath;
        return this;
    }

    /**
     * Set timeout in milliseconds for an action run.
     * It works differently depending on a target:
     * - Docker and JS file targets (`docker`, `jsFile`, `mainJsScript`, `preJsScript`, `postJsScript`): limits the
     *   maximum execution time interrupting a spawned process.
     * - Function targets (`syncFn`, `asyncFn`): doesn't limit an execution time, just sets `isTimedOut` property
     *   in a run result.
     *
     * If action exceeds the specified timeout, `isTimedOut` property of a run result will be set to `true`.
     */
    setTimeoutMs(timeoutMs: number|undefined): this {
        this.timeoutMs = timeoutMs;
        return this;
    }

    validate(): this {
        return this;
    }

    clone(): RunOptions {
        return new RunOptions(
            this.inputs.clone(),
            this.env.clone(),
            this.state.clone(),
            this.githubContext.clone(),
            this.githubServiceEnv.clone(),
            this.fakeFsOptions.clone(),
            this.outputOptions.clone(),
            this.shouldAddProcessEnv,
            this.shouldFakeMinimalGithubRunnerEnv,
            this.workingDir,
            this.workspaceDir,
            this.tempDir,
            this.timeoutMs
        );
    }
}