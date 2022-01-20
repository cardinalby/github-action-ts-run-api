import {EnvStore} from "../stores/EnvStore";
import {InputsStore} from "../stores/InputsStore";
import {StateStore} from "../stores/StateStore";
import {StringKeyValueObj} from "../types/StringKeyValueObj";
import {EnvInterface} from "../types/EnvInterface";
import {GithubContextStore} from "../stores/GithubContextStore";
import {GithubServiceEnvStore} from "../stores/GithubServiceEnvStore";
import {GithubContextInterface} from "../types/GithubContextInterface";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";
import {InitRunOptionsInterface} from "./InitRunOptionsInterface";
import {FakeFileOptionsStore} from "../stores/FakeFileOptionsStore";
import {FakeFileOptionsInterface} from "./FakeFileOptionsInterface";

export class RunOptions
{
    static create(init: InitRunOptionsInterface = {}): RunOptions {
        const defaultFakeFileOptions: FakeFileOptionsInterface = {
            unsetCommandFilesEnvs: true,
            fakeCommandFiles: true,
            fakeTempDir: true,
            cleanUpTempDir: true
        }

        return new RunOptions(
            new InputsStore(init.inputs || {}),
            new EnvStore(init.env || {}),
            new StateStore(init.state || {}),
            new GithubContextStore(init.githubContext || {}),
            new GithubServiceEnvStore(init.githubServiceEnv || {}),
            (new FakeFileOptionsStore(defaultFakeFileOptions)).apply(init.fakeFileOptions || {}),
            init.shouldFakeMinimalGithubRunnerEnv !== undefined ? init.shouldFakeMinimalGithubRunnerEnv : false,
            init.shouldParseStdout !== undefined ? init.shouldParseStdout : true,
            init.shouldPrintStdout !== undefined ? init.shouldPrintStdout : false,
            init.workingDir,
            init.timeoutMs
        );
    }

    protected constructor(
        public readonly inputs: InputsStore,
        public readonly env: EnvStore,
        public readonly state: StateStore,
        public readonly githubContext: GithubContextStore,
        public readonly githubServiceEnv: GithubServiceEnvStore,
        public readonly fakeFileOptions: FakeFileOptionsStore,
        public shouldFakeMinimalGithubRunnerEnv: boolean,
        public shouldParseStdout: boolean,
        public shouldPrintStdout: boolean,
        public workingDir: string|undefined,
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

    setFakeFileOptions(options: FakeFileOptionsInterface, update: false): this;
    setFakeFileOptions(options: Partial<FakeFileOptionsInterface>, update?: true): this;
    setFakeFileOptions(options: FakeFileOptionsInterface, update: boolean = true): this {
        update ? this.fakeFileOptions.apply(options) : this.fakeFileOptions.setData(options);
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

    setShouldFakeMinimalGithubRunnerEnv(doFake: boolean): this {
        this.shouldFakeMinimalGithubRunnerEnv = doFake;
        return this;
    }

    setGithubServiceEnv(githubEnv: GithubServiceEnvInterface, update: boolean = true): this {
        update ? this.githubServiceEnv.apply(githubEnv) : this.githubServiceEnv.setData(githubEnv);
        return this;
    }

    setShouldParseStdout(doParse: boolean): this {
        this.shouldParseStdout = doParse;
        return this;
    }

    setShouldPrintStdout(doSuppress: boolean): this {
        this.shouldPrintStdout = doSuppress;
        return this;
    }

    setWorkingDir(dirPath: string|undefined): this {
        this.workingDir = dirPath;
        return this;
    }

    setTimeoutMs(timeoutMs: number): this {
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
            this.fakeFileOptions.clone(),
            this.shouldFakeMinimalGithubRunnerEnv,
            this.shouldParseStdout,
            this.shouldPrintStdout,
            this.workingDir,
            this.timeoutMs
        );
    }
}