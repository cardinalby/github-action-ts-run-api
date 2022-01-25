import {RunnerDirInterface} from "./RunnerDirInterface";

export class ExternalRunnerDir implements RunnerDirInterface {
    // noinspection JSUnusedGlobalSymbols
    constructor(
        public readonly dirPath: string
    ) {}

    get existingDirPath(): string|undefined {
        return this.dirPath;
    }
}