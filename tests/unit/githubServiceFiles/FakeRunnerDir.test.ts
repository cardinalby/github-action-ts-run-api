import * as fs from "fs";
import {FakeRunnerDir} from "../../../src/githubServiceFiles/runnerDir/FakeRunnerDir";
import * as path from "path";

describe('FakeRunnerDir', () => {
    it('should clean up', () => {
        const dir = FakeRunnerDir.create();
        try {
            expect(fs.existsSync(dir.dirPath)).toEqual(true);
            fs.writeFileSync(path.join(dir.dirPath, 'file.txt'), 'data');
        } finally {
            dir.delete();
            expect(fs.existsSync(dir.dirPath)).toEqual(false);
        }
    })
});