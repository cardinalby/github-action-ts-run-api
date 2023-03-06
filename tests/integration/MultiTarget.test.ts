// noinspection ES6PreferShortImport

import * as path from "path";
import {RunOptions} from "../../src/runOptions/RunOptions";
import {RunTarget} from "../../src/runTarget/RunTarget";
import {syncPostRun, asyncPostRun} from "./testActions/complex/postRun.js"
import {run as githubServiceEnvImplImpl} from "./testActions/complex/githubServiceEnvImpl"
import {AsyncRunTargetInterface} from "../../src/runTarget/AsyncRunTargetInterface";
import { strict as assert } from 'assert';
import * as fs from "fs-extra";
import {GithubContextStore} from "../../src/runOptions/GithubContextStore";
import {GithubServiceEnvStore} from "../../src/runOptions/GithubServiceEnvStore";
import {getRunnerOs} from "../../src/utils/platformProps";
import {getNewGithubContext} from "../../src/utils/getNewGithubContext";
import {RunTargetInterface} from "../../src/runTarget/RunTargetInterface";
import {deleteAllFakedDirs} from "../../src";

const complexActionDir = 'tests/integration/testActions/complex/';
const complexActionActionYml = complexActionDir + 'action.yml';

describe('MultiTarget', () => {
    afterEach(() => {
        deleteAllFakedDirs();
    });

    const syncTargets: RunTargetInterface[] = [
        RunTarget.postJs(complexActionActionYml),
        RunTarget.asyncFn(syncPostRun, complexActionActionYml)
    ];

    test.each(syncTargets) (
        'should run SyncRunTargetInterface targets',
        async target => {
            const res = await target.run(
                RunOptions.create()
                    .setInputs({sendFileCommands: 'false'})
                    .setFakeFsOptions({fakeCommandFiles: false})
            );
            expect(res.commands.warnings).toEqual([path.resolve(process.cwd())]);
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(true);
            expect(res.warnings).toHaveLength(0);
        });

    const mixedTargets: RunTargetInterface[] = [
        RunTarget.postJs(complexActionActionYml),
        RunTarget.asyncFn(asyncPostRun, complexActionActionYml)
    ];

    test.each(mixedTargets)(
        'should run mixed targets',
        async target => {
            const res = await target.run(
                RunOptions.create()
                    .setInputs({sendFileCommands: 'false'})
                    .setFakeFsOptions({fakeCommandFiles: false})
            );
            expect(res.commands.warnings).toEqual([path.resolve(process.cwd())]);
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(true);
            expect(res.warnings).toHaveLength(0);
        });

    const serviceEnvTestTargets: AsyncRunTargetInterface[] = [
        RunTarget.jsFile(complexActionDir + 'githubServiceEnv.js'),
        RunTarget.asyncFn(async () => {
            githubServiceEnvImplImpl(getNewGithubContext(), fs, path);
        })
    ];

    test.each(serviceEnvTestTargets)(
        'should set github service env and temp dir',
        async target => {
            const res = await target.run(
                RunOptions.create()
                    .setShouldFakeMinimalGithubRunnerEnv(true)
                    .setGithubContext({
                        payload: {
                            pull_request: {
                                number: 12345
                            }
                        }
                    })
                    .setGithubServiceEnv({GITHUB_REF_NAME: 'ttt'})
                    .setFakeFsOptions({rmFakedTempDirAfterRun: false})
            );
            const tempDirPath = res.tempDirPath;
            try {
                expect(tempDirPath).not.toBeUndefined();
                assert(tempDirPath);
                expect(fs.existsSync(tempDirPath));
                const out = <any>fs.readJSONSync(path.join(tempDirPath, 'out.json'));
                expect(out.pr_number).toEqual(12345);
                expect(out.server_url).toEqual(GithubContextStore.SERVER_URL_DEFAULT);
                expect(out.event_name).toEqual(GithubContextStore.EVENT_NAME_DEFAULT);
                expect(out.github_actions_env).toEqual(GithubServiceEnvStore.GITHUB_ACTIONS_DEFAULT);
                expect(out.github_ref_name_env).toEqual('ttt');
                expect(out.runner_os).toEqual(getRunnerOs());
                expect(res.warnings).toHaveLength(0);
            } finally {
                res.cleanUpFakedDirs();
                tempDirPath && expect(fs.existsSync(tempDirPath)).toEqual(false);
                expect(res.tempDirPath).toBeUndefined();
            }
        });
});