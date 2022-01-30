export interface OutputOptionsInterface {
    /**
     * @default {true}
     * If `false` commands will not be parsed from stdout
     */
    parseStdoutCommands: boolean;

    /**
     * @default {undefined}
     * if undefined, stdout will be printed only if process.env.GITHUB_ACTIONS != 'true'
     * (so as not to accidentally interfere with github commands if run in GitHub CI)
     */
    printStdout: boolean|undefined;

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