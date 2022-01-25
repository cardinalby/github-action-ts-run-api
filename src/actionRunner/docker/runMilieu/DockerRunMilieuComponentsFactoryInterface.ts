import {RunnerDirsCollection} from "../../../githubServiceFiles/RunnerDirsCollection";
import {DockerRunnerDirsInterface} from "./DockerRunnerDirsInterface";
import {FakeFilesCollection} from "../../../githubServiceFiles/FakeFilesCollection";
import {EnvStore} from "../../../runOptions/EnvStore";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";

export interface DockerRunMilieuComponentsFactoryInterface {
    prepareRunnerDirs(): RunnerDirsCollection<DockerRunnerDirsInterface>;

    prepareFiles(fileCommandsDir: string, githubWorkflowDir: string): FakeFilesCollection;

    prepareEnv(
        fakeFiles: FakeFilesCollection,
        runnerDirs: RunnerDirsCollection<DockerRunnerDirsInterface>
    ): EnvStore;

    getVolumes(dirs: RunnerDirsCollection<DockerRunnerDirsInterface>): StringKeyValueObj;
}