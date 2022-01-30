import {RunOptions} from "../runOptions/RunOptions";
import {RunnerDirsCollection} from "../githubServiceFiles/RunnerDirsCollection";
import {FakeRunnerDir} from "../githubServiceFiles/runnerDir/FakeRunnerDir";
import {RunnerDirInterface} from "../githubServiceFiles/runnerDir/RunnerDirInterface";
import {ExternalRunnerDir} from "../githubServiceFiles/runnerDir/ExternalRunnerDir";
import {ActionConfigStoreOptional} from "../runOptions/ActionConfigStore";
import {BaseRunnerDirsInterface} from "./BaseRunnerDirsInterface";
import {FakeFilesCollection} from "../githubServiceFiles/FakeFilesCollection";
import {EnvStore} from "../runOptions/EnvStore";
import path from "path";
import {mapToObject} from "../utils/collections";
import {BaseRunMilieuComponentsFactoryInterface} from "./BaseRunMilieuComponentsFactoryInterface";
import {GithubContextStore} from "../runOptions/GithubContextStore";
import {GithubServiceEnvStore} from "../runOptions/GithubServiceEnvStore";

export class BaseRunMilieuComponentsFactory implements BaseRunMilieuComponentsFactoryInterface {
    constructor(
        public options: RunOptions,
        public actionConfig: ActionConfigStoreOptional,
        public actionYmlPath: string|undefined
    ) {}

    prepareRunnerDirs(): RunnerDirsCollection<BaseRunnerDirsInterface> {
        return RunnerDirsCollection.safePrepare(collection => {
            collection.data.temp = this.prepareTempDir();
            collection.data.workspace = this.prepareWorkspaceDir();
        });
    }

    prepareFiles(): FakeFilesCollection {
        return FakeFilesCollection.safePrepare(collection => {
            if (this.options.fakeFsOptions.data.fakeCommandFiles) {
                collection.createCommandFiles();
            }
            if (this.options.githubContext && this.options.githubContext.data.payload) {
                collection.createEventPayloadFile(this.options.githubContext.data.payload);
            }
        });
    }

    prepareEnv(
        fakeFiles: FakeFilesCollection,
        runnerDirs: RunnerDirsCollection<BaseRunnerDirsInterface>
    ): EnvStore {
        const envStore = new EnvStore(this.options.env.data);
        this.addProcessEnvToEnv(envStore);
        this.addInputsToEnv(envStore);
        this.addStateToEnv(envStore);
        this.addGithubServiceEnvToEnv(envStore);
        this.addGithubContextToEnv(envStore);
        this.addFilesToEnv(envStore, fakeFiles);
        this.addTempDirToEnv(envStore, runnerDirs.data.temp);
        this.addWorkspaceDirToEnv(envStore, runnerDirs.data.workspace);
        return envStore;
    }

    addProcessEnvToEnv(envStore: EnvStore) {
        if (this.options.shouldAddProcessEnv) {
            envStore.apply(process.env);
        }
    }

    addInputsToEnv(envStore: EnvStore) {
        if (!this.actionConfig.isEmpty()) {
            envStore.apply(this.actionConfig.getDefaultInputs().toEnvVariables());
        }
        envStore.apply(this.options.inputs.toEnvVariables());
    }

    addStateToEnv(envStore: EnvStore) {
        envStore.apply(this.options.state.toEnvVariables());
    }

    addGithubServiceEnvToEnv(envStore: EnvStore) {
        let githubServiceEnv = this.options.githubServiceEnv;
        if (this.options.shouldFakeMinimalGithubRunnerEnv) {
            let actionYmlPathEnvValue = undefined;
            if (this.actionConfig?.data?.runs?.using === 'composite' && this.actionYmlPath) {
                actionYmlPathEnvValue = path.resolve(path.dirname(this.actionYmlPath));
            }
            githubServiceEnv = (new GithubServiceEnvStore())
                .fakeMinimalRunnerEnv(actionYmlPathEnvValue)
                .apply(this.options.githubServiceEnv.data);
        }
        envStore.apply(githubServiceEnv.data);
    }

    addGithubContextToEnv(envStore: EnvStore) {
        const githubContext = this.options.shouldFakeMinimalGithubRunnerEnv
            ? (new GithubContextStore())
                .fakeMinimalRunnerContext(this.actionConfig.data?.name)
                .apply(this.options.githubContext.data)
            : this.options.githubContext;
        envStore.apply(githubContext.toEnvVariables());
    }

    addFilesToEnv(envStore: EnvStore, fakeFiles: FakeFilesCollection) {
        envStore.unsetFileCommandPaths();
        envStore.apply(mapToObject(
            fakeFiles.files,
            (name, file) => [file.filePathEnvVariable, file.filePath]
        ));
    }

    addTempDirToEnv(envStore: EnvStore, dir: RunnerDirInterface) {
        envStore.apply({RUNNER_TEMP: dir.dirPath});
    }

    addWorkspaceDirToEnv(envStore: EnvStore, dir: RunnerDirInterface) {
        envStore.apply({GITHUB_WORKSPACE: dir.dirPath});
    }

    prepareWorkspaceDir(): RunnerDirInterface {
        return this.options.workspaceDir
            ? new ExternalRunnerDir(this.options.workspaceDir)
            : FakeRunnerDir.create(this.options.fakeFsOptions.data.tmpRootDir);
    }

    prepareTempDir(): RunnerDirInterface {
        return this.options.tempDir
            ? new ExternalRunnerDir(this.options.tempDir)
            : FakeRunnerDir.create(this.options.fakeFsOptions.data.tmpRootDir);
    }
}