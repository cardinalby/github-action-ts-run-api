import { Writable, WritableOptions } from 'stream';

export interface WritableStreamBufferOptions extends WritableOptions {
    initialSize?: number;
    incrementAmount?: number;
}

export class WritableStreamBuffer extends Writable {
    private opts: WritableStreamBufferOptions = {};
    private readonly initialSize: number;
    private readonly incrementAmount: number;

    private buffer: Buffer;
    private _size: number = 0;

    public constructor(opts?: WritableStreamBufferOptions) {
        super(opts || {});
        this.opts = opts || {};
        this.initialSize = this.opts.initialSize || 8 * 1024;
        this.incrementAmount = this.opts.incrementAmount || 8 * 1024;
        this.buffer = Buffer.alloc(this.initialSize);
    }

    // noinspection JSUnusedGlobalSymbols
    public size() {
        return this._size;
    };

    // noinspection JSUnusedGlobalSymbols
    public maxSize() {
        return this.buffer.length;
    };

    // noinspection JSUnusedGlobalSymbols
    public getContents(length?: number): Buffer|false {
        if (!this._size) return false;

        const data = Buffer.alloc(Math.min(length || this._size, this._size));
        this.buffer.copy(data, 0, 0, data.length);

        if (data.length < this._size)
            this.buffer.copy(this.buffer, 0, data.length);

        this._size -= data.length;

        return data;
    };

    // noinspection JSUnusedGlobalSymbols
    public getContentsAsString(encoding?: BufferEncoding, length?: number): string|false {
        if (!this._size) {
            return false;
        }

        const data = this.buffer.toString(encoding || 'utf8', 0, Math.min(length || this._size, this._size));
        const dataLength = Buffer.byteLength(data);

        if (dataLength < this._size)
            this.buffer.copy(this.buffer, 0, dataLength);

        this._size -= dataLength;
        return data;
    };

    public increaseBufferIfNecessary(incomingDataSize: number) {
        if ((this.buffer.length - this._size) < incomingDataSize) {
            const factor = Math.ceil((incomingDataSize - (this.buffer.length - this._size)) / this.incrementAmount);

            const newBuffer = Buffer.alloc(this.buffer.length + (this.incrementAmount * factor));
            this.buffer.copy(newBuffer, 0, 0, this._size);
            this.buffer = newBuffer;
        }
    };

    // noinspection JSUnusedGlobalSymbols
    public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
        this.increaseBufferIfNecessary(chunk.length);
        chunk.copy(this.buffer, this._size, 0);
        this._size += chunk.length;
        callback();
    };
}