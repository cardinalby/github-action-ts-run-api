import {RunOptions} from "../runOptions/RunOptions";
import {BaseRunMilieu} from "./BaseRunMilieu";
import {BaseRunMilieuComponentsFactoryInterface} from "./BaseRunMilieuComponentsFactoryInterface";
import {RunMilieuFs} from "./RunMilieuFs";

export class BaseRunMilieuFactory {
    constructor(public componentsFactory: BaseRunMilieuComponentsFactoryInterface) {
    }

    public createMilieu(options: RunOptions): BaseRunMilieu {
        const runnerFs = RunMilieuFs.safePrepare((setFiles, setDirs) => {
            setDirs(this.componentsFactory.prepareRunnerDirs());
            setFiles(this.componentsFactory.prepareFiles())
        });
        try {
            const env = this.componentsFactory.prepareEnv(runnerFs.files, runnerFs.dirs);
            return new BaseRunMilieu(
                runnerFs.files,
                runnerFs.dirs,
                env.data,
                options.fakeFsOptions.data
            );
        } catch (err) {
            runnerFs.cleanUp();
            throw err;
        }
    }
}