import {FakeFilesCollection} from "../githubServiceFiles/FakeFilesCollection";
import {FakeRunnerDir} from "../githubServiceFiles/runnerDir/FakeRunnerDir";
import {EnvInterface} from "../types/EnvInterface";
import {BaseExecutionEffectsInterface} from "./BaseExecutionEffectsInterface";
import {FakeFsOptionsInterface} from "../runOptions/FakeFsOptionsInterface";
import {RunnerDirsCollection} from "../githubServiceFiles/RunnerDirsCollection";
import {BaseRunnerDirsInterface} from "./BaseRunnerDirsInterface";

export class BaseRunMilieu {
    public constructor(
        public readonly fakeFiles: FakeFilesCollection,
        public readonly runnerDirs: RunnerDirsCollection<BaseRunnerDirsInterface>,
        public readonly env: EnvInterface,
        public readonly fakeFsOptions: FakeFsOptionsInterface
    ) {}

    getEffects(fileCommandsEol: string): BaseExecutionEffectsInterface {
        return {
            fileCommands: this.fakeFiles.readFileCommands(fileCommandsEol),
            runnerDirs: this.runnerDirs
        };
    }

    restore() {
        this.cleanUpFakeFiles();
        this.cleanUpFakeDirs();
    }

    protected cleanUpFakeFiles() {
        this.fakeFiles.cleanUp();
    }

    protected cleanUpFakeDirs() {
        if (this.fakeFsOptions.rmFakedTempDirAfterRun && this.runnerDirs.data.temp instanceof FakeRunnerDir) {
            this.runnerDirs.data.temp.delete();
        }
        if (this.fakeFsOptions.rmFakedWorkspaceDirAfterRun && this.runnerDirs.data.workspace instanceof FakeRunnerDir) {
            this.runnerDirs.data.workspace.delete();
        }
    }
}