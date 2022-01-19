import {RunOptions} from "../../../runOptions/RunOptions";
import {AbstractJsFileTarget} from "../runTarget/AbstractJsFileTarget";
import {GithubServiceFileName, getKnownFileCommandNames} from "../../../githubServiceFiles/GithubServiceFileName";
import {FakeGithubServiceFile} from "../../../githubServiceFiles/FakeGithubServiceFile";
import {EnvStore} from "../../../stores/EnvStore";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import {readAddedPathsFromFileCommand, readExportedVarsFromFileCommand} from "../../../githubServiceFiles/readFileCommands";
import {FakeTempDir} from "../../../githubServiceFiles/FakeTempDir";

export interface ExecutionEffects {
    exportedVars: StringKeyValueObj,
    addedPaths: string[],
    tempDir: FakeTempDir|undefined
}

export class ChildProcExecutionEnvironment {
    static prepare(target: AbstractJsFileTarget, options: RunOptions) {
        const spawnEnv = new EnvStore(options.env.data);
        if (target.actionConfig !== undefined) {
            spawnEnv.apply(target.actionConfig.getDefaultInputs().toEnvVariables());
        }
        spawnEnv.apply(options.inputs.toEnvVariables());
        spawnEnv.apply(options.state.toEnvVariables());
        spawnEnv.apply(options.githubServiceEnv.data);

        const fakeFileCommandFiles = new Map(options.shouldFakeServiceFiles
            ? getKnownFileCommandNames().map(name => [name, FakeGithubServiceFile.create(name)])
            : []
        );
        const githubContextExport = options.githubContext.export();
        if (githubContextExport.eventPayloadFile) {
            fakeFileCommandFiles.set(githubContextExport.eventPayloadFile.name, githubContextExport.eventPayloadFile);
        }
        spawnEnv.apply(githubContextExport.envVariables);
        fakeFileCommandFiles.forEach(file => spawnEnv.apply(file.filePathEnvVariable));
        let tempDir = undefined;
        if (options.shouldFakeTempDir.fake) {
            tempDir = FakeTempDir.create();
            spawnEnv.apply(tempDir.dirPathEnvVariable);
        }

        return new ChildProcExecutionEnvironment(
            fakeFileCommandFiles,
            tempDir,
            options.shouldFakeTempDir.cleanUp,
            spawnEnv.data
        );
    }

    protected constructor(
        public fakeServiceFiles: Map<GithubServiceFileName, FakeGithubServiceFile>,
        public tempDir: FakeTempDir|undefined,
        public cleanUpTempDir: boolean,
        public spawnEnv: StringKeyValueObj
    ) {
    }

    getEffects(): ExecutionEffects {
        const effects = {
            addedPaths: [] as string[],
            exportedVars: {},
            tempDir: this.tempDir
        }
        this.fakeServiceFiles.forEach((file, cmdName) => {
            switch (cmdName) {
                case GithubServiceFileName.ENV:
                    effects.exportedVars = readExportedVarsFromFileCommand(file.filePath);
                    break;
                case GithubServiceFileName.PATH:
                    effects.addedPaths = readAddedPathsFromFileCommand(file.filePath);
                    break;
            }
        });
        return effects;
    }

    restore() {
        this.fakeServiceFiles.forEach(file => file.delete());
        if (this.cleanUpTempDir && this.tempDir) {
            this.tempDir.delete();
        }
    }
}