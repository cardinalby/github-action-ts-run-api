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

export class RunOptions
{
    static create(init: InitRunOptionsInterface = {}): RunOptions {
        return new RunOptions(
            new InputsStore(init.inputs || {}),
            new EnvStore(init.env || {}),
            new StateStore(init.state || {}),
            new GithubContextStore(init.githubContext || {}),
            new GithubServiceEnvStore(init.githubServiceEnv || {}),
            init.shouldFakeServiceFiles !== undefined ? init.shouldFakeServiceFiles : true,
            init.shouldFakeTempDir !== undefined ? init.shouldFakeTempDir : {fake: true, cleanUp: true},
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
        public shouldFakeServiceFiles: boolean,
        public shouldFakeTempDir: { fake: boolean, cleanUp: boolean },
        public shouldParseStdout: boolean,
        public shouldPrintStdout: boolean,
        public workingDir: string|undefined,
        public timeoutMs: number|undefined
    ) {}

    addProcessEnv(): this {
        this.env.apply(process.env);
        return this;
    }

    setEnv(env: EnvInterface, update: boolean = true): this {
        update ? this.env.apply(env) : this.env.setData(env);
        return this;
    }

    setShouldFakeServiceFiles(doFake: boolean): this {
        this.shouldFakeServiceFiles = doFake;
        return this;
    }

    setShouldFakeTempDir(doFake: boolean, cleanUp: boolean): this {
        this.shouldFakeTempDir = {fake: doFake, cleanUp: cleanUp};
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

    fakeMinimalGithubContext(): this {
        this.githubContext.setDefaults();
        return this;
    }

    setGithubServiceEnv(githubEnv: GithubServiceEnvInterface, update: boolean = true): this {
        update ? this.githubServiceEnv.apply(githubEnv) : this.githubServiceEnv.setData(githubEnv);
        return this;
    }

    fakeMinimalGithubServiceEnv(): this {
        this.githubServiceEnv.setDefaults();
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
        if (!this.shouldFakeServiceFiles && this.githubContext.data.payload !== undefined) {
            throw new Error(
                'If you set githubContext.payload is set, you should also set shouldFakeServiceFiles to true'
            );
        }
        return this;
    }

    clone(): RunOptions {
        return new RunOptions(
            this.inputs.clone(),
            this.env.clone(),
            this.state.clone(),
            this.githubContext.clone(),
            this.githubServiceEnv.clone(),
            this.shouldFakeServiceFiles,
            this.shouldFakeTempDir,
            this.shouldParseStdout,
            this.shouldPrintStdout,
            this.workingDir,
            this.timeoutMs
        );
    }
}