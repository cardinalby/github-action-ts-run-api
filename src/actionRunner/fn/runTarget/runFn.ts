import {TimeoutDetector} from "./TimeoutDetector";

interface TargetFnResult<R> {
    error: any,
    fnResult: R | undefined,
    timedOut: boolean
}

export function runSyncFn<R>(fn: () => R, timeoutMs: number | undefined): TargetFnResult<R> {
    const timeoutDetector = TimeoutDetector.start(timeoutMs);
    try {
        return {error: undefined, fnResult: fn(), timedOut: timeoutDetector.isTimedOut()};
    } catch (err) {
        return {error: err, fnResult: undefined, timedOut: timeoutDetector.isTimedOut()}
    }
}

export async function runAsyncFn<R>(fn: () => Promise<R>, timeoutMs: number | undefined): Promise<TargetFnResult<R>> {
    const timeoutDetector = TimeoutDetector.start(timeoutMs);
    try {
        return {error: undefined, fnResult: await fn(), timedOut: timeoutDetector.isTimedOut()};
    } catch (err) {
        return {error: err, fnResult: undefined, timedOut: timeoutDetector.isTimedOut()}
    }
}