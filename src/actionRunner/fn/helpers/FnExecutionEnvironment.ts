import {AbstractFnTarget} from "../runTarget/AbstractFnTarget";
import {RestoreProcessPropsFn, saveProcessProps} from "./saveProcessProps";
import {GithubServiceFileName, getKnownFileCommandNames} from "../../../githubServiceFiles/GithubServiceFileName";
import {FakeGithubServiceFile} from "../../../githubServiceFiles/FakeGithubServiceFile";
import {StdoutInterceptor} from "./StdoutInterceptor";
import {CommandsStoreInterface} from "../../../stores/CommandsStoreInterface";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import {StdoutCommandsExtractor} from "../../../stdout/StdoutCommandsExtractor";
import {readAddedPathsFromFileCommand, readExportedVarsFromFileCommand} from "../../../githubServiceFiles/readFileCommands";
import {RunOptions} from "../../../runOptions/RunOptions";
import {CommandsStore} from "../../../stores/CommandsStore";
import {FakeTempDir} from "../../../githubServiceFiles/FakeTempDir";

export interface ExecutionEffects {
    exitCode: number|undefined;
    commands: CommandsStoreInterface;
    tempDir: FakeTempDir|undefined;
    stdout: string;
}

export class FnExecutionEnvironment {
    static prepare(target: AbstractFnTarget<any>, options: RunOptions): FnExecutionEnvironment {
        const restoreProcessProps = saveProcessProps();
        if (options.workingDir !== undefined) {
            process.chdir(options.workingDir);
        }
        FnExecutionEnvironment.addToProcessEnv(options.env.data);

        if (target.actionConfig !== undefined) {
            FnExecutionEnvironment.addToProcessEnv(target.actionConfig.getDefaultInputs().toEnvVariables())
        }
        FnExecutionEnvironment.addToProcessEnv(options.inputs.toEnvVariables());
        FnExecutionEnvironment.addToProcessEnv(options.state.toEnvVariables());
        FnExecutionEnvironment.addToProcessEnv(options.githubServiceEnv.data);

        const fakeFileCommandFiles = new Map(options.shouldFakeServiceFiles
            ? getKnownFileCommandNames().map(name => [name, FakeGithubServiceFile.create(name)])
            : []
        );
        const githubContextExport = options.githubContext.export();
        if (githubContextExport.eventPayloadFile) {
            fakeFileCommandFiles.set(githubContextExport.eventPayloadFile.name, githubContextExport.eventPayloadFile);
        }
        FnExecutionEnvironment.addToProcessEnv(githubContextExport.envVariables);
        fakeFileCommandFiles.forEach(file => FnExecutionEnvironment.addToProcessEnv(file.filePathEnvVariable));
        let tempDir = undefined;
        if (options.shouldFakeTempDir) {
            tempDir = FakeTempDir.create();
            FnExecutionEnvironment.addToProcessEnv(tempDir.dirPathEnvVariable);
        }

        return new FnExecutionEnvironment(
            restoreProcessProps,
            fakeFileCommandFiles,
            tempDir,
            options.shouldFakeTempDir.cleanUp,
            StdoutInterceptor.start(options.shouldPrintStdout)
        )
    }

    protected constructor(
        public restoreProcessProps: RestoreProcessPropsFn,
        public fakeFileCommandFiles: Map<GithubServiceFileName, FakeGithubServiceFile>,
        public fakeRunnerTempDir: FakeTempDir|undefined,
        public cleanUpFakeRunnerTempDir: boolean,
        public stdoutInterceptor: StdoutInterceptor
    ) {
    }

    getEffects(parseStdoutCommands: boolean): ExecutionEffects {
        const commands = parseStdoutCommands
            ? StdoutCommandsExtractor.extract(this.stdoutInterceptor.interceptedData)
            : new CommandsStore()
        this.fakeFileCommandFiles.forEach((file, cmdName) => {
            switch (cmdName) {
                case GithubServiceFileName.ENV:
                    commands.exportedVars = readExportedVarsFromFileCommand(file.filePath);
                    break;
                case GithubServiceFileName.PATH:
                    commands.addedPaths = readAddedPathsFromFileCommand(file.filePath);
                    break;
            }
        });
        return {
            exitCode: process.exitCode,
            stdout: this.stdoutInterceptor.interceptedData,
            commands: commands,
            tempDir: this.fakeRunnerTempDir
        }
    }

    restore() {
        this.stdoutInterceptor.unHook();
        this.fakeFileCommandFiles.forEach(file => file.delete());
        if (this.cleanUpFakeRunnerTempDir && this.fakeRunnerTempDir) {
            this.fakeRunnerTempDir.delete();
        }
        this.restoreProcessProps();
    }

    private static addToProcessEnv(vars: StringKeyValueObj) {
        Object.assign(process.env, vars);
    }
}