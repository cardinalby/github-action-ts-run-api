import {OutputTransform} from "./OutputTransform";

export interface OutputOptionsInterface {
    /**
     * @default {true}
     * If `false` commands will not be parsed from stdout
     */
    parseStdoutCommands: boolean;

    /**
     * @default {true}
     * If `false` commands will not be parsed from stderr.
     * It's not documented, but GitHub parses commands from both stdout and stderr
     */
    parseStderrCommands: boolean;

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
     *    if process.env.GITHUB_ACTIONS == 'true' then {OutputTransform.SANITIZE_COMMANDS}
     *    if process.env.GITHUB_ACTIONS != 'true' then {OutputTransform.NONE}
     * @default {undefined}
     */
    stdoutTransform: OutputTransform|undefined;

    /**
     * @default {true}
     * Print action stderr to process stderr
     */
    printStderr: boolean;

    /**
     * Sets the way stderr will be transformed before printing (if printStderr == true)
     * undefined:
     *    if process.env.GITHUB_ACTIONS == 'true' then {OutputTransform.SANITIZE_COMMANDS}
     *    if process.env.GITHUB_ACTIONS != 'true' then {OutputTransform.NONE}
     * @default {undefined}
     */
    stderrTransform: OutputTransform|undefined;

    /**
     * @default {false}
     * Print additional debug information
     */
    printRunnerDebug: boolean;

    /**
     * Print warnings to stderr (similar to GitHub Runner) at the end of an action run
     */
    printRunnerWarnings: boolean;
}