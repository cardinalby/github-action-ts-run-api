export interface OutputOptionsInterface {
    /**
     * @default {true}
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
     */
    printStderr: boolean;

    /**
     * @default {false}
     */
    printRunnerDebug: boolean;
}