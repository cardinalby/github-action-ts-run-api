import {CommandsStore} from "../runResult/CommandsStore";
import {CommandsParsingStream} from "./CommandsParsingStream";
import {Warning} from "../runResult/warnings/Warning";
import {DeprecatedStdoutCommandWarning} from "../runResult/warnings/DeprecatedStdoutCommandWarning";
import {StdoutCommandInterface, StdoutCommandName} from "./stdoutCommands";

/**
 * It's not documented, but GitHub Actions parses commands from both stdout and stderr streams
 */
export class OutputsCommandsCollector {
    public readonly commandsStore = new CommandsStore();
    public readonly stdoutParsingStream?: CommandsParsingStream;
    public readonly stderrParsingStream?: CommandsParsingStream;
    public readonly commandsWarnings = new Map<StdoutCommandName|string, Warning>()

    public constructor(
        private parseStdout: boolean,
        private parseStderr: boolean
    ) {
        const createStream = () => new CommandsParsingStream();
        const addCmdToStore = (cmd: StdoutCommandInterface) => {
            this.checkDeprecation(cmd);
            this.commandsStore.addStdoutCommand(cmd);
        }
        if (parseStdout) {
            this.stdoutParsingStream = createStream();
            this.stdoutParsingStream.on('data', addCmdToStore);
        }
        if (parseStderr) {
            this.stderrParsingStream = createStream();
            this.stderrParsingStream.on('data', addCmdToStore);
        }
    }

    async waitUntilStreamsAreClosed(): Promise<void> {
        if (this.stdoutParsingStream) {
            await this.stdoutParsingStream.waitUntilClosed();
        }
        if (this.stderrParsingStream) {
            await this.stderrParsingStream.waitUntilClosed();
        }
    }

    get deprecationWarnings(): Warning[] {
        return [...this.commandsWarnings.values()]
    }

    private checkDeprecation(cmd: StdoutCommandInterface) {
        let msg = undefined;

        switch (cmd.command) {
            case StdoutCommandName.SAVE_STATE:
            case StdoutCommandName.SET_OUTPUT: {
                msg = `Deprecated ${cmd.command} command issued. See https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/`
                break;
            }
            case StdoutCommandName.ADD_PATH:
            case StdoutCommandName.SET_ENV: {
                msg = `Deprecated ${cmd.command} command issued. See https://github.blog/changelog/2020-10-01-github-actions-deprecating-set-env-and-add-path-commands/`;
                break;
            }
        }

        if (msg !== undefined && !this.commandsWarnings.has(cmd.command)) {
            this.commandsWarnings.set(cmd.command, new DeprecatedStdoutCommandWarning(msg, cmd.command))
        }
    }
}