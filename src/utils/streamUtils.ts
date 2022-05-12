export function chunkToString(chunk: any, encoding: BufferEncoding): string {
    if (Buffer.isBuffer(chunk)) {
        return (chunk as Buffer).toString("utf8");
    } else if (encoding !== "utf8") {
        return Buffer.from(chunk, encoding).toString("utf8");
    }
    return chunk;
}
