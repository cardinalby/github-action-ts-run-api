import {ParsedFileCommandsInterface} from "../runResult/ParsedCommandsInterface";
import {RunnerDirsCollection} from "../githubServiceFiles/RunnerDirsCollection";
import {BaseRunnerDirsInterface} from "./BaseRunnerDirsInterface";

export interface BaseExecutionEffectsInterface {
    fileCommands: ParsedFileCommandsInterface,
    runnerDirs: RunnerDirsCollection<BaseRunnerDirsInterface>
}