export class TimeoutDetector {
    static start(timeoutMs: number|undefined): TimeoutDetector {
        return new TimeoutDetector(
            timeoutMs ? process.hrtime.bigint() : undefined,
            timeoutMs
        );
    }

    private constructor(
        public readonly startTick: bigint|undefined,
        public readonly timeoutMs: number|undefined
    ) {}

    isTimedOut(): boolean {
        return this.startTick && this.timeoutMs
            ? (process.hrtime.bigint() - this.startTick) / BigInt(1000000) > this.timeoutMs
            : false;
    }
}