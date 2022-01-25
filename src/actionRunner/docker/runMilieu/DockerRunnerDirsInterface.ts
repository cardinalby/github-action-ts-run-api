import {BaseRunnerDirsInterface} from "../../../runMilieu/BaseRunnerDirsInterface";
import {FakeRunnerDir} from "../../../githubServiceFiles/runnerDir/FakeRunnerDir";

export interface DockerRunnerDirsInterface extends BaseRunnerDirsInterface {
    githubHome: FakeRunnerDir;
    fileCommands: FakeRunnerDir;
    githubWorkflow: FakeRunnerDir;
}