import {getFileCommandNames, GithubServiceFileName} from "./GithubServiceFileName";
import {FakeFile} from "./FakeFile";
import {readAddedPathsFromFileCommand, readExportedVarsFromFileCommand} from "./readFileCommands";
import {ParsedFileCommandsInterface} from "../runResult/ParsedCommandsInterface";
import fs from "fs-extra";
import {WebhookPayload} from "@actions/github/lib/interfaces";

export class FakeFilesCollection {
    /**
     * Create collection and modify it in a callback. Clean up any added files in case of error
     */
    static safePrepare(callback: (collection: FakeFilesCollection) => any): FakeFilesCollection {
        const collection = new FakeFilesCollection();
        try {
            callback(collection);
            return collection;
        } catch (err) {
            collection.cleanUp();
            throw err;
        }
    }

    public files = new Map<GithubServiceFileName, FakeFile>();

    createCommandFiles(tempDirPath?: string): this {
        return this.createCommandFilesImpl(undefined, tempDirPath);
    }

    createCommandFilesInDir(dirPath?: string): this {
        return this.createCommandFilesImpl(dirPath, undefined);
    }

    protected createCommandFilesImpl(dirPath: string|undefined, tempDirPath: string|undefined): this {
        const commandFileNames = getFileCommandNames();
        const existingFiles = commandFileNames.filter(name => this.files.has(name));
        if (existingFiles.length > 0) {
            throw new Error(`Command files ${existingFiles.join(', ')} already exist`);
        }
        commandFileNames.forEach(name => this.files.set(
            name,
            dirPath
                ? FakeFile.createInDir(name, dirPath, name)
                : FakeFile.create(name, tempDirPath)));
        return this;
    }

    createEventPayloadFile(payload: WebhookPayload, tempDirPath?: string, fileName?: string): this {
        return this.createEventPayloadFileImpl(payload, undefined, tempDirPath, fileName);
    }

    createEventPayloadFileInDir(payload: WebhookPayload, dirPath?: string, fileName?: string): this {
        return this.createEventPayloadFileImpl(payload, dirPath, undefined, fileName);
    }

    createEventPayloadFileImpl(
        payload: WebhookPayload,
        dirPath: string|undefined,
        tempDirPath: string|undefined,
        fileName: string|undefined
    ): this {
        if (this.files.has(GithubServiceFileName.EVENT_PATH)) {
            throw new Error(`Event payload file already exists`);
        }
        const file = dirPath
            ? FakeFile.createInDir(GithubServiceFileName.EVENT_PATH, dirPath, fileName)
            : FakeFile.create(GithubServiceFileName.EVENT_PATH, tempDirPath);
        this.files.set(GithubServiceFileName.EVENT_PATH, file);
        fs.writeFileSync(file.filePath, JSON.stringify(payload));
        return this;
    }

    readFileCommands(eol: string): Partial<ParsedFileCommandsInterface> {
        const result: Partial<ParsedFileCommandsInterface> = {}
        this.files.forEach((file, cmdName) => {
            switch (cmdName) {
                case GithubServiceFileName.ENV:
                    result.exportedVars = readExportedVarsFromFileCommand(file.filePath, eol);
                    break;
                case GithubServiceFileName.PATH:
                    result.addedPaths = readAddedPathsFromFileCommand(file.filePath, eol);
                    break;
            }
        });
        return result;
    }

    cleanUp(): void {
        this.files.forEach(file => file.delete());
    }
}