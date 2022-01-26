import {TimeoutDetector} from "./TimeoutDetector";

interface TargetFnResult<R> {
    error: any,
    fnResult: R | undefined,
    timedOut: boolean,
    durationMs: number
}

export function runSyncFn<R>(fn: () => R, timeoutMs: number | undefined): TargetFnResult<R> {
    const timeoutDetector = TimeoutDetector.start(timeoutMs);
    try {
        return {error: undefined, fnResult: fn(), ...timeoutDetector.measure()};
    } catch (err) {
        return {error: err, fnResult: undefined, ...timeoutDetector.measure()}
    }
}

export async function runAsyncFn<R>(fn: () => Promise<R>, timeoutMs: number | undefined): Promise<TargetFnResult<R>> {
    const timeoutDetector = TimeoutDetector.start(timeoutMs);
    try {
        return {error: undefined, fnResult: await fn(), ...timeoutDetector.measure()};
    } catch (err) {
        return {error: err, fnResult: undefined, ...timeoutDetector.measure()}
    }
}