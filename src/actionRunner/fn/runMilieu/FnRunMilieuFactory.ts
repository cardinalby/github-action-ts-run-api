import {RunOptions} from "../../../runOptions/RunOptions";
import {RunMilieuFs} from "../../../runMilieu/RunMilieuFs";
import {BaseRunMilieuComponentsFactory} from "../../../runMilieu/BaseRunMilieuComponentsFactory";
import {FnRunMilieu} from "./FnRunMilieu";
import {saveProcessProps} from "./saveProcessProps";
import {StdoutInterceptor} from "./StdoutInterceptor";

export class FnRunMilieuFactory {
    constructor(public componentsFactory: BaseRunMilieuComponentsFactory) {
    }

    public createMilieu(options: RunOptions): FnRunMilieu {
        const runnerFs = RunMilieuFs.safePrepare((setFiles, setDirs) => {
            setDirs(this.componentsFactory.prepareRunnerDirs());
            setFiles(this.componentsFactory.prepareFiles())
        });
        try {
            const env = this.componentsFactory.prepareEnv(runnerFs.files, runnerFs.dirs);
            const restoreProcessProps = saveProcessProps();
            if (options.workingDir !== undefined) {
                process.chdir(options.workingDir);
            }
            const stdoutInterceptor = StdoutInterceptor.start(
                options.outputOptions.shouldPrintStdout, options.outputOptions.data.printStderr
            );
            const fnRunMilieu = new FnRunMilieu(
                runnerFs.files,
                runnerFs.dirs,
                env.data,
                options.fakeFsOptions.data,
                restoreProcessProps,
                stdoutInterceptor
            );
            process.env = fnRunMilieu.env;
            return fnRunMilieu;
        } catch (err) {
            runnerFs.cleanUp();
            throw err;
        }
    }
}