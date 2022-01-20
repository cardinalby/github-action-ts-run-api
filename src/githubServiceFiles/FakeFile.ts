import tmp from "tmp";
import {GithubServiceFileName} from "./GithubServiceFileName";

export class FakeFile {
    static getFilePathEnvVariable(name: GithubServiceFileName): string {
        return `GITHUB_${name}`;
    }

    static create(name: GithubServiceFileName): FakeFile {
        return new FakeFile(
            tmp.fileSync({
                prefix: name,
                keep: true
            }),
            name
        );
    }

    private _createdTmp: tmp.FileResult|undefined;

    protected constructor(
        createdTmp: tmp.FileResult,
        public readonly name: GithubServiceFileName,
        public readonly filePath = createdTmp.name
    ) {
        this._createdTmp = createdTmp;
    }

    get filePathEnvVariable(): string {
        return FakeFile.getFilePathEnvVariable(this.name);
    }

    delete() {
        if (this._createdTmp === undefined) {
            throw new Error(`${this.name} fake file hasn't been created.`);
        }
        this._createdTmp.removeCallback();
        this._createdTmp = undefined;
    }
}