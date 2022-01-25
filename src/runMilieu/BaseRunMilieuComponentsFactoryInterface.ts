import {RunnerDirsCollection} from "../githubServiceFiles/RunnerDirsCollection";
import {BaseRunnerDirsInterface} from "./BaseRunnerDirsInterface";
import {FakeFilesCollection} from "../githubServiceFiles/FakeFilesCollection";
import {EnvStore} from "../runOptions/EnvStore";

export interface BaseRunMilieuComponentsFactoryInterface {
    prepareRunnerDirs(): RunnerDirsCollection<BaseRunnerDirsInterface>;

    prepareFiles(): FakeFilesCollection;

    prepareEnv(
        fakeFiles: FakeFilesCollection,
        runnerDirs: RunnerDirsCollection<BaseRunnerDirsInterface>
    ): EnvStore;
}