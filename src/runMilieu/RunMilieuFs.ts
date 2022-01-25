import {BaseRunnerDirsInterface} from "./BaseRunnerDirsInterface";
import {FakeFilesCollection} from "../githubServiceFiles/FakeFilesCollection";
import {RunnerDirsCollection} from "../githubServiceFiles/RunnerDirsCollection";

export class RunMilieuFs<Dirs extends BaseRunnerDirsInterface> {
    static safePrepare<Dirs extends BaseRunnerDirsInterface>(
        callback: (
            setFiles: (files: FakeFilesCollection) => FakeFilesCollection,
            setDirs: (files: RunnerDirsCollection<Dirs>) => RunnerDirsCollection<Dirs>
        ) => any
    ): RunMilieuFs<Dirs> {
        let files: FakeFilesCollection|undefined;
        let dirs: RunnerDirsCollection<Dirs>|undefined;
        try {
            callback(f => files = f, d => dirs = d);
            if (!files) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error("Files weren't set");
            }
            if (!dirs) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error("Dirs weren't set");
            }
            return new RunMilieuFs<Dirs>(files, dirs);
        } catch (err) {
            files && files.cleanUp();
            dirs && dirs.cleanUpFakeDirs();
            throw err;
        }
    }

    constructor(
        public readonly files: FakeFilesCollection,
        public readonly dirs: RunnerDirsCollection<Dirs>
    ) {}

    cleanUp() {
        this.files.cleanUp();
        this.dirs.cleanUpFakeDirs();
    }
}