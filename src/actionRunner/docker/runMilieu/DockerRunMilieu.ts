import {BaseRunMilieu} from "../../../runMilieu/BaseRunMilieu";
import {FakeFilesCollection} from "../../../githubServiceFiles/FakeFilesCollection";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import {RunnerDirsCollection} from "../../../githubServiceFiles/RunnerDirsCollection";
import {EnvInterface} from "../../../types/EnvInterface";
import {FakeFsOptionsInterface} from "../../../runOptions/FakeFsOptionsInterface";
import {DockerRunnerDirsInterface} from "./DockerRunnerDirsInterface";
import {BaseExecutionEffectsInterface} from "../../../runMilieu/BaseExecutionEffectsInterface";

export class DockerRunMilieu {
    public static CONTAINER_OS_EOL = '\n';

    private _baseMilieu: BaseRunMilieu;

    constructor(
        fakeFiles: FakeFilesCollection,
        public readonly runnerDirs: RunnerDirsCollection<DockerRunnerDirsInterface>,
        public readonly env: EnvInterface,
        fakeFsOptions: FakeFsOptionsInterface,
        public readonly volumes: StringKeyValueObj
    ) {
        const baseRunnerDirs = new RunnerDirsCollection({
            temp: runnerDirs.data.temp,
            workspace: runnerDirs.data.workspace
        });
        this._baseMilieu = new BaseRunMilieu(fakeFiles, baseRunnerDirs, env, fakeFsOptions);
    }

    getEffects(): BaseExecutionEffectsInterface {
        return this._baseMilieu.getEffects(DockerRunMilieu.CONTAINER_OS_EOL);
    }

    public restore() {
        this._baseMilieu.restore();
        this.runnerDirs.data.fileCommands.delete();
        this.runnerDirs.data.githubHome.delete();
        this.runnerDirs.data.githubWorkflow.delete();
    }
}