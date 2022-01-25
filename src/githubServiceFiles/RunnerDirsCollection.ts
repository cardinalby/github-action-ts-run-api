import {AbstractStore} from "../utils/AbstractStore";
import {BaseRunnerDirsInterface} from "../runMilieu/BaseRunnerDirsInterface";
import {FakeRunnerDir} from "./runnerDir/FakeRunnerDir";

export class RunnerDirsCollection<Dirs extends BaseRunnerDirsInterface>
    extends AbstractStore<Dirs>
{
    static safePrepare<Dirs extends BaseRunnerDirsInterface>(
        callback: (collection: RunnerDirsCollection<Dirs>) => any
    ): RunnerDirsCollection<Dirs> {
        const collection = new RunnerDirsCollection<Dirs>();
        try {
            callback(collection);
            return collection;
        } catch (err) {
            collection.cleanUpFakeDirs();
            throw err;
        }
    }

    cleanUpFakeDirs() {
        Object.values(this._data)
            .forEach(dir => dir instanceof FakeRunnerDir && dir.delete())
    }
}