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
            printStderr: true,
            printStdout: undefined,
            printRunnerDebug: false
        }
        return new RunOptions(
            new InputsStore(init.inputs || {}),
            new EnvStore(init.env || {}),
            new StateStore(init.state || {}),
            new GithubContextStore(init.githubContext || {}),
            new GithubServiceEnvStore(init.githubServiceEnv || {}),
            (new FakeFsOptionsStore(defaultFakeFsOptions)).apply(init.fakeFsOptions || {}),
            (new OutputOptionsStore(defaultOutputHandlingOptions)).apply(init.outputOptions || {}),
            init.shouldFakeMinimalGithubRunnerEnv !== undefined ? init.shouldFakeMinimalGithubRunnerEnv : false,
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
        public shouldFakeMinimalGithubRunnerEnv: boolean,
        public workingDir: string|undefined,
        public workspaceDir: string|undefined,
        public tempDir: string|undefined,
        public timeoutMs: number|undefined,
    ) {}

    addProcessEnv(): this {
        this.env.apply(process.env);
        return this;
    }

    setEnv(env: EnvInterface, update: boolean = true): this {
        update ? this.env.apply(env) : this.env.setData(env);
        return this;
    }

    setFakeFsOptions(options: FakeFsOptionsInterface, update: false): this;
    setFakeFsOptions(options: Partial<FakeFsOptionsInterface>, update?: true): this;
    setFakeFsOptions(options: FakeFsOptionsInterface, update: boolean = true): this {
        update ? this.fakeFsOptions.apply(options) : this.fakeFsOptions.setData(options);
        return this;
    }

    setInputs(inputsUpdate: StringKeyValueObj, update: boolean = true): this {
        update ? this.inputs.apply(inputsUpdate) : this.inputs.setData(inputsUpdate);
        return this;
    }

    setState(state: StringKeyValueObj, update: boolean = true): this {
        update ? this.state.apply(state) : this.state.setData(state);
        return this;
    }

    setGithubContext(context: GithubContextInterface, update: boolean = true): this {
        update ? this.githubContext.apply(context) : this.githubContext.setData(context);
        return this;
    }

    setOutputOptions(options: OutputOptionsInterface, update: false): this;
    setOutputOptions(options: Partial<OutputOptionsInterface>, update?: true): this;
    setOutputOptions(options: OutputOptionsInterface, update: boolean = true): this {
        update ? this.outputOptions.apply(options) : this.outputOptions.setData(options);
        return this;
    }

    setShouldFakeMinimalGithubRunnerEnv(doFake: boolean): this {
        this.shouldFakeMinimalGithubRunnerEnv = doFake;
        return this;
    }

    setGithubServiceEnv(githubEnv: GithubServiceEnvInterface, update: boolean = true): this {
        update ? this.githubServiceEnv.apply(githubEnv) : this.githubServiceEnv.setData(githubEnv);
        return this;
    }

    setWorkingDir(dirPath: string|undefined): this {
        this.workingDir = dirPath;
        return this;
    }

    setWorkspaceDir(dirPath: string|undefined): this {
        this.workspaceDir = dirPath;
        return this;
    }

    setTempDir(dirPath: string|undefined): this {
        this.tempDir = dirPath;
        return this;
    }

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
            this.shouldFakeMinimalGithubRunnerEnv,
            this.workingDir,
            this.workspaceDir,
            this.tempDir,
            this.timeoutMs
        );
    }
}