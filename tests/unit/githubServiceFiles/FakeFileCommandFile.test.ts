import {FakeGithubServiceFile} from "../../../src/githubServiceFiles/FakeGithubServiceFile";
import {GithubServiceFileName} from "../../../src/githubServiceFiles/GithubServiceFileName";
import * as fs from "fs";

describe('FakeFileCommandFile', () => {
    it('should clean up', () => {
        const file = FakeGithubServiceFile.create(GithubServiceFileName.ENV);
        try {
            expect(file.name).toEqual(GithubServiceFileName.ENV);
            expect(fs.existsSync(file.filePath)).toEqual(true);
            expect(fs.readFileSync(file.filePath).toString()).toEqual('');
            fs.writeFileSync(file.filePath, 'abc');
        } finally {
            file.delete();
            expect(fs.existsSync(file.filePath)).toEqual(false);
        }
    })
});