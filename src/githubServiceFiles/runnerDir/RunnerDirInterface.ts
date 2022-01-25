export interface OptionalRunnerDirInterface {
    readonly existingDirPath: string|undefined;
}

export interface RunnerDirInterface extends OptionalRunnerDirInterface {
    readonly dirPath: string;
}