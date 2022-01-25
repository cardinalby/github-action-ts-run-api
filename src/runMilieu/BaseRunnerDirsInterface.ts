import {RunnerDirInterface} from "../githubServiceFiles/runnerDir/RunnerDirInterface";

export interface BaseRunnerDirsInterface {
    [k: string]: RunnerDirInterface;

    temp: RunnerDirInterface;
    workspace: RunnerDirInterface;
}