export class Duration {
    static startMeasuring(): Duration {
        return new Duration(process.hrtime.bigint());
    }

    constructor(private startTick: bigint) {}

    measure(): bigint {
        return process.hrtime.bigint() - this.startTick;
    }

    measureMs(): number {
        return Number(this.measure() / BigInt(1000000));
    }
}