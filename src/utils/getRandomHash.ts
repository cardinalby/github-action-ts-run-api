import crypto from "crypto";

export function getRandomHash(): string {
    return crypto.createHash('md5')
        .update(process.hrtime.bigint().toString())
        .update(crypto.randomBytes(32))
        .digest('hex');
}