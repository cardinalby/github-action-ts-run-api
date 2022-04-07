import {StdoutTransform} from "./StdoutTransform";

export interface OutputOptionsInterface {
    /**
     * @default {true}
     * If `false` commands will not be parsed from stdout
     */
    parseStdoutCommands: boolean;

    /**
     * Sets what should be printed to stdout from tested action stdout
     * true: print tested action stdout directly to the runner stdout
     * false: print nothing
     *
     * @default {true}
     */
    printStdout: boolean;

    /**
     * Sets the way stdout will be transformed before printing (if printStdout == true)
     * undefined:
     *    if process.env.GITHUB_ACTIONS == 'true' then {StdoutTransform.SANITIZE_COMMANDS}
     *    if process.env.GITHUB_ACTIONS != 'true' then {StdoutTransform.NONE}
     * @default {undefined}
     */
    stdoutTransform: StdoutTransform|undefined;

    /**
     * @default {true}
     * Print action stderr to process stderr
     */
    printStderr: boolean;

    /**
     * @default {false}
     * Print additional debug information
     */
    printRunnerDebug: boolean;
}