import {Duration} from "../../../utils/Duration";

export class TimeoutDetector {
    static start(timeoutMs: number|undefined): TimeoutDetector {
        return new TimeoutDetector(
            timeoutMs ? Duration.startMeasuring() : undefined,
            timeoutMs
        );
    }

    private constructor(
        public readonly duration: Duration|undefined,
        public readonly timeoutMs: number|undefined
    ) {}

    isTimedOut(): boolean {
        return this.duration && this.timeoutMs
            ? this.duration.measureMs() > this.timeoutMs
            : false;
    }
}