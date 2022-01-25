import {FakeFile} from "../../../src/githubServiceFiles/FakeFile";
import {GithubServiceFileName} from "../../../src/githubServiceFiles/GithubServiceFileName";
import * as fs from "fs";
import {FakeRunnerDir} from "../../../src/githubServiceFiles/runnerDir/FakeRunnerDir";
import * as path from "path";

describe('FakeFileCommandFile', () => {
    it('should clean up', () => {
        const file = FakeFile.create(GithubServiceFileName.ENV, undefined);
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

    it('should create in dir', () => {
        const dir = FakeRunnerDir.create();
        try {
            const file = FakeFile.createInDir(GithubServiceFileName.ENV, dir.dirPath);
            try {
                expect(file.name).toEqual(GithubServiceFileName.ENV);
                expect(fs.existsSync(file.filePath)).toEqual(true);
                expect(path.dirname(file.filePath)).toEqual(dir.dirPath);
                expect(fs.readFileSync(file.filePath).toString()).toEqual('');
                fs.writeFileSync(file.filePath, 'abc');
            } finally {
                file.delete();
                expect(fs.existsSync(file.filePath)).toEqual(false);
            }
        } finally {
            dir.delete();
        }
    })
});