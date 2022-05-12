import {CommandInterface, CommandsStore} from "../runResult/CommandsStore";
import {CommandsParsingStream} from "./CommandsParsingStream";

/**
 * It's not documented, but GitHub Actions parses commands from both stdout and stderr streams
 */
export class OutputsCommandsCollector {
    public readonly commandsStore = new CommandsStore();
    public readonly stdoutParsingStream?: CommandsParsingStream;
    public readonly stderrParsingStream?: CommandsParsingStream;

    public constructor(
        private parseStdout: boolean,
        private parseStderr: boolean
    ) {
        const createStream = () => new CommandsParsingStream();
        const addCmdToStore = (cmd: CommandInterface) => this.commandsStore.addCommand(cmd);
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
}