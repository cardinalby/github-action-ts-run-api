import {getFileCommandNames, GithubServiceFileName} from "./GithubServiceFileName";
import {FakeFile} from "./FakeFile";
import {EnvInterface} from "../types/EnvInterface";
import {readAddedPathsFromFileCommand, readExportedVarsFromFileCommand} from "./readFileCommands";
import {ParsedFileCommandsInterface} from "../stores/ParsedCommandsInterface";

export class FakeFilesCollection {
    static createCommandFiles(): FakeFilesCollection {
        return new FakeFilesCollection(getFileCommandNames().map(FakeFile.create));
    }

    public files: Map<GithubServiceFileName, FakeFile>;

    constructor(files?: Map<GithubServiceFileName, FakeFile>);
    constructor(files?: FakeFile[]);
    constructor(f: Map<GithubServiceFileName, FakeFile>|FakeFile[]|undefined) {
        if (f === undefined) {
            this.files = new Map();
        } else {
            this.files = f instanceof Map
                ? f
                : new Map(f.map(file => [file.name, file]));
        }
    }

    add(file: FakeFile) {
        if (this.files.has(file.name)) {
            throw new Error(`File ${file.name} already exists in fake files collection`);
        }
        this.files.set(file.name, file);
    }

    getEnvVariables(): Partial<EnvInterface> {
        const result: Partial<EnvInterface> = {};
        this.files.forEach(file => result[file.filePathEnvVariable] = file.filePath);
        return result;
    }

    readFileCommands(): Partial<ParsedFileCommandsInterface> {
        const result: Partial<ParsedFileCommandsInterface> = {}
        this.files.forEach((file, cmdName) => {
            switch (cmdName) {
                case GithubServiceFileName.ENV:
                    result.exportedVars = readExportedVarsFromFileCommand(file.filePath);
                    break;
                case GithubServiceFileName.PATH:
                    result.addedPaths = readAddedPathsFromFileCommand(file.filePath);
                    break;
            }
        });
        return result;
    }

    cleanUpFiles(): void {
        this.files.forEach(file => file.delete());
    }
}