import {RunOptions} from "../../../runOptions/RunOptions";
import {RunMilieuFs} from "../../../runMilieu/RunMilieuFs";
import {DockerRunMilieu} from "./DockerRunMilieu";
import {DockerRunMilieuComponentsFactoryInterface} from "./DockerRunMilieuComponentsFactoryInterface";
import {DockerRunnerDirsInterface} from "./DockerRunnerDirsInterface";

export class DockerRunMilieuFactory {
    constructor(public componentsFactory: DockerRunMilieuComponentsFactoryInterface) {
    }

    public createMilieu(options: RunOptions): DockerRunMilieu {
        const runnerFs = RunMilieuFs.safePrepare<DockerRunnerDirsInterface>((setFiles, setDirs) => {
            const dirs = setDirs(this.componentsFactory.prepareRunnerDirs());
            setFiles(this.componentsFactory.prepareFiles(
                dirs.data.fileCommands.dirPath,
                dirs.data.githubWorkflow.dirPath
            ))
        });
        try {
            const env = this.componentsFactory.prepareEnv(runnerFs.files, runnerFs.dirs);
            return new DockerRunMilieu(
                runnerFs.files,
                runnerFs.dirs,
                env.data,
                options.fakeFsOptions.data,
                this.componentsFactory.getVolumes(runnerFs.dirs)
            );
        } catch (err) {
            runnerFs.cleanUp();
            throw err;
        }
    }
}