import {BaseExecutionEffectsInterface} from "../../../runMilieu/BaseExecutionEffectsInterface";
import {StdoutCommandsInterface} from "../../../runResult/ParsedCommandsInterface";

export interface FnExecutionEffectsInterface extends BaseExecutionEffectsInterface {
    exitCode: number | undefined;
    stdoutCommands: StdoutCommandsInterface;
    stdout: string;
    stderr: string;
}