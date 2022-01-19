import * as fs from "fs";
import {FakeTempDir} from "../../../src/githubServiceFiles/FakeTempDir";
import * as path from "path";

describe('FakeTempDir', () => {
    it('should clean up', () => {
        const dir = FakeTempDir.create();
        try {
            expect(typeof dir.dirPathEnvVariable.RUNNER_TEMP === 'string').toEqual(true);
            expect(fs.existsSync(dir.dirPath)).toEqual(true);
            fs.writeFileSync(path.join(dir.dirPath, 'file.txt'), 'data');
        } finally {
            dir.delete();
            expect(fs.existsSync(dir.dirPath)).toEqual(false);
        }
    })
});