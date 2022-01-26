import {Duration} from "../../../utils/Duration";

export class TimeoutDetector {
    static start(timeoutMs: number|undefined): TimeoutDetector {
        return new TimeoutDetector(
            Duration.startMeasuring(),
            timeoutMs
        );
    }

    public constructor(
        public readonly duration: Duration,
        public readonly timeoutMs: number|undefined
    ) {}

    measure(): {durationMs: number, timedOut: boolean } {
        const durationMs = this.duration.measureMs();
        return {
            durationMs,
            timedOut: this.timeoutMs
                ? this.duration.measureMs() > this.timeoutMs
                : false
        }
    }
}