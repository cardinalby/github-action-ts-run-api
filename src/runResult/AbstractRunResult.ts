import {RunResultInterface} from "./RunResultInterface";
import {ParsedCommandsInterface} from "./ParsedCommandsInterface";
import {FakeRunnerDir} from "../githubServiceFiles/runnerDir/FakeRunnerDir";
import {OptionalRunnerDirInterface} from "../githubServiceFiles/runnerDir/RunnerDirInterface";
import {RunnerWarning} from "./warnings/RunnerWarning";

export abstract class AbstractRunResult implements RunResultInterface
{
    readonly isSuccess: boolean;

    protected constructor(
        public readonly commands: ParsedCommandsInterface,
        public readonly error: Error|any|undefined,
        public readonly durationMs: number,
        public readonly isTimedOut: boolean,
        public readonly exitCode: number|undefined,
        public readonly stdout: string|undefined,
        public readonly stderr: string|undefined,
        public readonly runnerWarnings: RunnerWarning[],
        private readonly tempDir: OptionalRunnerDirInterface,
        private readonly workspaceDir: OptionalRunnerDirInterface
    ) {
        this.isSuccess = (this.exitCode === 0 || this.exitCode === undefined) && this.error === undefined;
    }

    get tempDirPath(): string|undefined {
        return this.tempDir.existingDirPath;
    }

    get workspaceDirPath(): string|undefined {
        return this.workspaceDir.existingDirPath;
    }

    cleanUpFakedDirs(): this {
        if (this.tempDir instanceof FakeRunnerDir) {
            this.tempDir.delete();
        }
        if (this.workspaceDir instanceof FakeRunnerDir) {
            this.workspaceDir.delete();
        }
        return this;
    }
}