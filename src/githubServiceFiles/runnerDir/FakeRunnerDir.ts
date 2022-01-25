import tmp from "tmp";
import fs from "fs-extra";
import {RunnerDirInterface} from "./RunnerDirInterface";

const globalExistingFakedDirs = new Set<FakeRunnerDir>();

export function deleteAllFakedDirs(): void {
    globalExistingFakedDirs.forEach(dir => dir.delete());
}

export class FakeRunnerDir implements RunnerDirInterface {
    static create(tmpDirPath?: string|undefined): FakeRunnerDir {
        return new FakeRunnerDir(
            tmp.dirSync({
                keep: true,
                tmpdir: tmpDirPath
            }).name,
            false
        );
    }

    protected constructor(
        public readonly dirPath: string,
        public cleanedUp: boolean
    ) {
        globalExistingFakedDirs.add(this);
    }

    delete() {
        if (!this.cleanedUp && fs.existsSync(this.dirPath)) {
            // this._createdTmp.removeCallback() fails if dir is not empty
            fs.removeSync(this.dirPath);
            this.cleanedUp = true;
        }
        globalExistingFakedDirs.delete(this);
    }

    get existingDirPath(): string | undefined {
        return !this.cleanedUp && fs.existsSync(this.dirPath)
            ? this.dirPath
            : undefined;
    }
}