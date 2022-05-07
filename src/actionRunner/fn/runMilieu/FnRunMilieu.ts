import {RestoreProcessPropsFn} from "./saveProcessProps";
import {StdoutInterceptor} from "./StdoutInterceptor";
import {BaseRunMilieu} from "../../../runMilieu/BaseRunMilieu";
import {FnExecutionEffectsInterface} from "./FnExecutionEffectsInterface";
import {FakeFilesCollection} from "../../../githubServiceFiles/FakeFilesCollection";
import {RunnerDirsCollection} from "../../../githubServiceFiles/RunnerDirsCollection";
import {EnvInterface} from "../../../types/EnvInterface";
import {FakeFsOptionsInterface} from "../../../runOptions/FakeFsOptionsInterface";
import {BaseRunnerDirsInterface} from "../../../runMilieu/BaseRunnerDirsInterface";
import os from "os";

export class FnRunMilieu {
    private _baseRunMilieu: BaseRunMilieu;

    constructor(
        fakeFiles: FakeFilesCollection,
        runnerDirs: RunnerDirsCollection<BaseRunnerDirsInterface>,
        public readonly env: EnvInterface,
        fakeFsOptions: FakeFsOptionsInterface,
        public readonly restoreProcessProps: RestoreProcessPropsFn,
        public readonly stdoutInterceptor: StdoutInterceptor,
    ) {
        this._baseRunMilieu = new BaseRunMilieu(fakeFiles, runnerDirs, env, fakeFsOptions);
    }

    getEffects(): FnExecutionEffectsInterface {
        const baseEffects = this._baseRunMilieu.getEffects(os.EOL);
        this.stdoutInterceptor.finishCommandsParsing();
        return {
            ...baseEffects,
            stdoutCommands: this.stdoutInterceptor.parsedCommands.data,
            exitCode: process.exitCode,
            stdout: this.stdoutInterceptor.interceptedStdout,
            stderr: this.stdoutInterceptor.interceptedStderr
        };
    }

    restore() {
        this.stdoutInterceptor.unHook();
        this.restoreProcessProps();
        this._baseRunMilieu.restore();
    }
}