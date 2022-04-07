import {Transform, TransformCallback} from "stream";
import os from "os";

export class CommandsSanitizerStream extends Transform {
    private _unprocessedLine = '';

    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        if (Buffer.isBuffer(chunk)) {
            chunk = (chunk as Buffer).toString("utf8");
        } else if (encoding !== "utf8") {
            chunk = Buffer.from(chunk, encoding).toString("utf8");
        }
        this._unprocessedLine += chunk;
        // I don't know how GitHub runner separates lines: based on os separator or os-independent
        // So I detect both \r\n and \n separators and replace them with os.EOL
        const lines = this._unprocessedLine.split(/\r?\n/);
        if (lines.length > 1) {
            for (let i = 0; i < lines.length - 1; ++i) {
                this.push(CommandsSanitizerStream.sanitizeLine(lines[i]) + os.EOL, "utf8");
            }
            this._unprocessedLine = lines[lines.length - 1];
        }
        callback();
    }

    _flush(callback: TransformCallback) {
        this.push(CommandsSanitizerStream.sanitizeLine(this._unprocessedLine));
        callback();
    }

    private static sanitizeLine(str: string): string {
        return str.replace(/^::([A-Za-z0-9\-_.]+?)(\s.+)?::/m, '⦂⦂$1$2⦂⦂');
    }
}