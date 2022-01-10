import fs from "fs-extra";
import tmp from "tmp";
import path from "path";

export interface FileStateRecoveryPointInterface {
    get restored(): boolean;
    restore(): void;
}

export type FileStateRecoveryPointFactoryFn = (filePath: string) => FileStateRecoveryPoint;

export class FileStateRecoveryPoint implements FileStateRecoveryPointInterface {
    private readonly _tmpPath: string|undefined;
    private readonly _path: string;
    private _restored: boolean;

    static create(filePath: string): FileStateRecoveryPoint {
        if (fs.existsSync(filePath)) {
            const tmpPath = tmp.tmpNameSync({prefix: path.basename(filePath)});
            fs.copyFileSync(filePath, tmpPath);
            return new FileStateRecoveryPoint(tmpPath, filePath);
        } else {
            return new FileStateRecoveryPoint(undefined, filePath);
        }
    }

    private constructor(tmpPath: string | undefined, path: string) {
        this._tmpPath = tmpPath;
        this._path = path;
        this._restored = false;
    }

    get restored(): boolean {
        return this._restored;
    }

    restore(): void {
        if (this._restored) {
            throw new Error('File already restored');
        }
        if (this._tmpPath) {
            fs.copyFileSync(this._tmpPath, this._path);
        } else {
            if (fs.existsSync(this._path)) {
                fs.unlinkSync(this._path);
            }
        }
        this._restored = true
    }
}