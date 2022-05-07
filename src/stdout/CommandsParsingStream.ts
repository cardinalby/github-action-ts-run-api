import {Writable, WritableOptions} from "stream";
import {CommandInterface} from "../runResult/CommandsStore";
import {parseStdoutCommand} from "./parseStdoutCommand";

export class CommandsParsingStream extends Writable {
    private _unprocessedLine = '';
    private _isClosed: boolean = false;

    constructor(
        public readonly onCommand: (cmd: CommandInterface) => void,
        opts?: WritableOptions
    ) {
        super(opts);
        this.on('close', () => this._isClosed = true)
    }

    // noinspection JSUnusedGlobalSymbols
    get closed() {
        return this._isClosed;
    }

    async waitUntilClosed(): Promise<void> {
        if (this._isClosed) {
            return;
        }
        return new Promise(resolve => this.on('close', resolve));
    }

    _write(chunk: any, encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
        if (Buffer.isBuffer(chunk)) {
            chunk = (chunk as Buffer).toString("utf8");
        } else if (encoding !== "utf8") {
            chunk = Buffer.from(chunk, encoding).toString("utf8");
        }
        this._unprocessedLine += chunk;
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
        callback();
    }
}