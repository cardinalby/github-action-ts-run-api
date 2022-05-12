import {Transform, TransformCallback} from "stream";
import {parseStdoutCommand} from "./parseStdoutCommand";
import {chunkToString} from "../utils/streamUtils";

/**
 * emits commands objects
 * @see CommandInterface
 */
export class CommandsParsingStream extends Transform {
    private _unprocessedLine = '';
    private _isClosed: boolean = false;

    constructor() {
        super({
            readableObjectMode: true,
            writableObjectMode: false,
            // For node < 14
            autoDestroy: true
        });
        this.on('close', () => this._isClosed = true);
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

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        chunk = chunkToString(chunk, encoding);
        this._unprocessedLine += chunk;
        const lines = this._unprocessedLine.split(/\r?\n/);
        if (lines.length > 1) {
            for (let i = 0; i < lines.length - 1; ++i) {
                if (lines[i]) {
                    const cmd = parseStdoutCommand(lines[i]);
                    if (cmd !== undefined) {
                        this.push(cmd);
                    }
                }
            }
            this._unprocessedLine = lines[lines.length - 1];
        }
        callback();
    }
}