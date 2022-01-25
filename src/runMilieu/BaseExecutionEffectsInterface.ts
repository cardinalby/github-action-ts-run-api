import {ParsedFileCommandsInterface} from "../runResult/ParsedCommandsInterface";
import {RunnerDirsCollection} from "../githubServiceFiles/RunnerDirsCollection";
import {BaseRunnerDirsInterface} from "./BaseRunnerDirsInterface";

export interface BaseExecutionEffectsInterface {
    fileCommands: Partial<ParsedFileCommandsInterface>,
    runnerDirs: RunnerDirsCollection<BaseRunnerDirsInterface>
}