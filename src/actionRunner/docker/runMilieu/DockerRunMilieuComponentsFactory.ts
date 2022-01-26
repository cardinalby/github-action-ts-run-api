import {RunOptions} from "../../../runOptions/RunOptions";
import {ActionConfigStoreFilled} from "../../../runOptions/ActionConfigStore";
import {RunnerDirsCollection} from "../../../githubServiceFiles/RunnerDirsCollection";
import {DockerRunnerDirsInterface} from "./DockerRunnerDirsInterface";
import {BaseRunMilieuComponentsFactory} from "../../../runMilieu/BaseRunMilieuComponentsFactory";
import {FakeRunnerDir} from "../../../githubServiceFiles/runnerDir/FakeRunnerDir";
import {EnvStore} from "../../../runOptions/EnvStore";
import {FakeFilesCollection} from "../../../githubServiceFiles/FakeFilesCollection";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import {mapObject, mapToObject} from "../../../utils/collections";
import {GithubServiceFileName} from "../../../githubServiceFiles/GithubServiceFileName";
import path from "path";
import {DockerRunMilieuComponentsFactoryInterface} from "./DockerRunMilieuComponentsFactoryInterface";
import assert from "assert";

export class DockerRunMilieuComponentsFactory implements DockerRunMilieuComponentsFactoryInterface {
    static readonly DIRS_MOUNTING_POINTS: {[k in keyof DockerRunnerDirsInterface]: string} = {
        githubHome: '/github/home',
        temp: '/home/runner/work/_temp',
        workspace: '/github/workspace',
        githubWorkflow: '/github/workflow',
        fileCommands: '/github/file_commands'
    };

    protected baseComponentsFactory: BaseRunMilieuComponentsFactory;

    constructor(
        public options: RunOptions,
        public actionConfig: ActionConfigStoreFilled,
        public actionYmlPath: string|undefined
    ) {
        this.baseComponentsFactory = new BaseRunMilieuComponentsFactory(options, actionConfig, actionYmlPath);
    }

    prepareRunnerDirs(): RunnerDirsCollection<DockerRunnerDirsInterface> {
        const baseDirs = this.baseComponentsFactory.prepareRunnerDirs();
        return RunnerDirsCollection.safePrepare<DockerRunnerDirsInterface>(collection => {
            collection.apply(baseDirs.data);
            collection.data.githubHome = this.prepareGithubHomeDir();
            collection.data.fileCommands = this.prepareFileCommandsDir();
            collection.data.githubWorkflow = this.prepareGithubWorkflowDir();
        });
    }

    prepareFiles(fileCommandsDir?: string, githubWorkflowDir?: string): FakeFilesCollection {
        return FakeFilesCollection.safePrepare(collection => {
            if (this.options.fakeFsOptions.data.fakeCommandFiles) {
                collection.createCommandFilesInDir(fileCommandsDir);
            }
            if (this.options.githubContext && this.options.githubContext.data.payload) {
                collection.createEventPayloadFileInDir(
                    this.options.githubContext.data.payload, githubWorkflowDir, `event.json`
                );
            }
        });
    }

    prepareEnv(
        fakeFiles: FakeFilesCollection,
        runnerDirs: RunnerDirsCollection<DockerRunnerDirsInterface>
    ): EnvStore {
        const envStore = new EnvStore(this.options.env.data);
        this.baseComponentsFactory.addInputsToEnv(envStore);
        this.baseComponentsFactory.addStateToEnv(envStore);
        this.baseComponentsFactory.addGithubServiceEnvToEnv(envStore);
        this.baseComponentsFactory.addGithubContextToEnv(envStore);
        this.addFilesToEnv(envStore, fakeFiles, runnerDirs);
        this.addTempDirToEnv(envStore);
        this.addWorkspaceDirToEnv(envStore);
        return envStore;
    }

    getVolumes(dirs: RunnerDirsCollection<DockerRunnerDirsInterface>): StringKeyValueObj {
        return mapObject(
            dirs.data,
            (name, dir) => [dir.dirPath, DockerRunMilieuComponentsFactory.DIRS_MOUNTING_POINTS[name]]
        );
    }

    protected getFakeFileDirName(name: string): keyof DockerRunnerDirsInterface {
        switch (name) {
            case GithubServiceFileName.EVENT_PATH: return 'githubWorkflow';
            default: return 'fileCommands';
        }
    }

    protected addFilesToEnv(
        envStore: EnvStore,
        fakeFiles: FakeFilesCollection,
        runnerDirs: RunnerDirsCollection<DockerRunnerDirsInterface>
    ) {
        envStore.unsetFileCommandPaths();
        envStore.apply(mapToObject(
            fakeFiles.files,
            (name, file) => {
                const dirName = this.getFakeFileDirName(name);
                const dirPath = runnerDirs.data[dirName].dirPath;
                assert(
                    path.dirname(file.filePath) === dirPath,
                    `File ${name} has path = "${file.filePath}" that is not in "${dirPath}" dir`
                );
                return [
                    file.filePathEnvVariable,
                    path.posix.join(
                        DockerRunMilieuComponentsFactory.DIRS_MOUNTING_POINTS[dirName],
                        path.basename(file.filePath)
                    )
                ]}
        ));
    }

    protected addTempDirToEnv(envStore: EnvStore) {
        envStore.apply({RUNNER_TEMP: DockerRunMilieuComponentsFactory.DIRS_MOUNTING_POINTS.temp});
    }

    protected addWorkspaceDirToEnv(envStore: EnvStore) {
        envStore.apply({GITHUB_WORKSPACE: DockerRunMilieuComponentsFactory.DIRS_MOUNTING_POINTS.workspace});
    }

    protected prepareGithubHomeDir(): FakeRunnerDir {
        return FakeRunnerDir.create(this.options.fakeFsOptions.data.tmpRootDir);
    }

    protected prepareFileCommandsDir(): FakeRunnerDir {
        return FakeRunnerDir.create(this.options.fakeFsOptions.data.tmpRootDir);
    }

    protected prepareGithubWorkflowDir(): FakeRunnerDir {
        return FakeRunnerDir.create(this.options.fakeFsOptions.data.tmpRootDir);
    }
}