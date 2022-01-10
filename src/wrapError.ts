export function wrapErrorWithPrefix<T>(fn: () => T, messagePrefix: string): T {
    try {
        return fn();
    } catch (err) {
        throw new Error(messagePrefix + err);
    }
}

export function wrapError<T>(fn: () => T, transformError: (err: Error) => Error): T {
    try {
        return fn();
    } catch (err) {
        if (err instanceof Error) {
            throw transformError(err);
        } else {
            throw err;
        }
    }
}