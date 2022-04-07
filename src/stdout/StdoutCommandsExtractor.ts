import {CommandsStore, CommandInterface} from "../runResult/CommandsStore";
import {parseStdoutCommand} from "./parseStdoutCommand";

export class StdoutCommandsExtractor {
    private _unprocessedLine = '';

    static extract(stdoutData: string): CommandsStore {
        const commandsStore = new CommandsStore();
        const extractor = new StdoutCommandsExtractor(cmd => {
            commandsStore.addCommand(cmd);
        });
        extractor.onStdoutData(stdoutData);
        return commandsStore;
    }

    constructor(public readonly onCommand: (cmd: CommandInterface) => void) {
    }

    onStdoutData(data: string) {
        this._unprocessedLine += data;
        const lines = this._unprocessedLine.split(/\r?\n/);
        if (lines.length > 1) {
            for (let i = 0; i < lines.length - 1; ++i) {
                if (lines[i]) {
                    const cmd = parseStdoutCommand(lines[i]);
                    if (cmd !== undefined) {
                        this.onCommand(cmd);
                    }
                }
            }
            this._unprocessedLine = lines[lines.length - 1];
        }
    }
}