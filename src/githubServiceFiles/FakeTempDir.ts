import tmp from "tmp";
import {GithubServiceEnvInterface} from "../types/GithubServiceEnvInterface";
import fs from "fs-extra";

export class FakeTempDir {
    static create(): FakeTempDir {
        return new FakeTempDir(
            tmp.dirSync({
                prefix: 'runnerTemp',
                keep: true
            })
        );
    }

    private _createdTmp: tmp.DirResult|undefined;

    protected constructor(
        createdTmp: tmp.DirResult,
        public readonly dirPath = createdTmp.name,
        public readonly dirPathEnvVariable: GithubServiceEnvInterface = { RUNNER_TEMP: createdTmp.name }
    ) {
        this._createdTmp = createdTmp;
    }

    delete() {
        if (this._createdTmp !== undefined) {
            // this._createdTmp.removeCallback() fails if dir is not empty
            fs.removeSync(this._createdTmp.name);
            this._createdTmp = undefined;
        }
    }
}