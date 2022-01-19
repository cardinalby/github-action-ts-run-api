import tmp from "tmp";
import {GithubServiceFileName} from "./GithubServiceFileName";
import {StringKeyValueObj} from "../types/StringKeyValueObj";

export class FakeGithubServiceFile {
    static create(name: GithubServiceFileName): FakeGithubServiceFile {
        return new FakeGithubServiceFile(
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
        public readonly filePath = createdTmp.name,
        public readonly filePathEnvVariable: StringKeyValueObj =
            {[`GITHUB_${name}`]: createdTmp.name}
    ) {
        this._createdTmp = createdTmp;
    }

    delete() {
        if (this._createdTmp === undefined) {
            throw new Error(`${this.name} fake file hasn't been created.`);
        }
        this._createdTmp.removeCallback();
        this._createdTmp = undefined;
    }
}