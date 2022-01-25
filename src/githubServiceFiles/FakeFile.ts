import tmp from "tmp";
import {GithubServiceFileName} from "./GithubServiceFileName";
import fs from "fs-extra";
import crypto from "crypto"
import * as path from "path";

export class FakeFile {
    static getFilePathEnvVariable(name: GithubServiceFileName): string {
        return `GITHUB_${name}`;
    }

    static createInDir(name: GithubServiceFileName, dirPath: string, fileName?: string): FakeFile {
        if (fileName === undefined) {
            fileName = name + '_' + crypto.createHash('md5').update(dirPath + name).digest('hex');
        }
        const filePath = path.resolve(dirPath, fileName);
        fs.closeSync(fs.openSync(
            filePath,
            fs.constants.O_CREAT | fs.constants.O_EXCL  | fs.constants.O_RDWR
        ));
        return new FakeFile(name, filePath);
    }

    static create(name: GithubServiceFileName, tempDirPath: string|undefined): FakeFile {
        return new FakeFile(
            name,
            tmp.fileSync({
                prefix: name,
                keep: true,
                tmpdir: tempDirPath
            }).name
        );
    }

    protected constructor(
        public readonly name: GithubServiceFileName,
        public readonly filePath: string
    ) {}

    get filePathEnvVariable(): string {
        return FakeFile.getFilePathEnvVariable(this.name);
    }

    delete() {
        if (fs.existsSync(this.filePath)) {
            fs.unlinkSync(this.filePath);
        }
    }
}