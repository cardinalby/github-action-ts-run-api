import {Transform, TransformCallback} from "stream";
import {parseStdoutCommand} from "./parseStdoutCommand";
import {chunkToString} from "../utils/streamUtils";

/**
 * emits commands objects
 * @see CommandInterface
 */
export class CommandsParsingStream extends Transform {
    private _unprocessedLine = '';

    constructor() {
        super({
            readableObjectMode: true,
            writableObjectMode: false,
            autoDestroy: true
        });
    }

    async waitUntilClosed(): Promise<void> {
        if (this.closed) {
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
