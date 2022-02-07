// noinspection ES6PreferShortImport

import {RunOptions} from "../../src/runOptions/RunOptions";
import {
    DockerRunMilieuComponentsFactory
} from "../../src/actionRunner/docker/runMilieu/DockerRunMilieuComponentsFactory";
import tmp from "tmp";
import fs from "fs-extra";
import path from "path";
import {DockerCli} from "../../src/actionRunner/docker/runTarget/dockerCli";
import * as os from "os";
import {RunTarget} from "../../src";
import * as http from "http";
import {withDockerCompose} from "../../src/actionRunner/docker/utils/withDockerCompose";
import {getDockerHostName} from "../../src/actionRunner/docker/utils/getDockerHostName";

const dockerActionDir = 'tests/integration/testActions/dockerAction/';
const dockerActionYml = dockerActionDir + 'action.yml';

describe('DockerTarget', () => {
    const target = RunTarget.dockerAction(dockerActionYml);

    if (!DockerCli.isInstalled() || process.env.SKIP_DOCKER_TARGET_TEST === 'true') {
        test.only('Docker is not installed, skip tests', () => {
            expect(target.actionConfig.data?.name).toEqual('tttteeeessstt');
        })
    }

    test.each([
        [true,  true,   undefined, undefined],
        [true,  false,  undefined, undefined],
        [false, true,   undefined, undefined],
        [true,  false,  undefined, undefined],
        [true,  true,   'tmp',     'tmp'],
        [true,  false,  'tmp',     'tmp'],
        [false, true,   'tmp',     'tmp'],
        [false, false,  'tmp',     'tmp'],
    ])(
        'should handle cleanUpTmp: %s, cleanUpWorkspace: %s, wsExternalDir: %s, tempExternalDir: %s',
        async (cleanUpTmp, cleanUpWorkspace, wsExternalDir, tempExternalDir) => {
            if (wsExternalDir === 'tmp') {
                wsExternalDir = tmp.dirSync({keep: true}).name;
            }
            if (tempExternalDir === 'tmp') {
                tempExternalDir = tmp.dirSync({keep: true}).name;
            }
            const res = await target.run(RunOptions.create()
                .setFakeFsOptions({rmFakedTempDirAfterRun: cleanUpTmp, rmFakedWorkspaceDirAfterRun: cleanUpWorkspace})
                .setWorkspaceDir(wsExternalDir)
                .setTempDir(tempExternalDir)
            );
            try {
                expect(res.isSuccess).toEqual(true);
                wsExternalDir && expect(res.workspaceDirPath).toEqual(wsExternalDir);
                if (!cleanUpWorkspace || wsExternalDir) {
                    expect(res.workspaceDirPath &&
                        fs.readFileSync(path.join(res.workspaceDirPath, 'w.txt')).toString()
                    ).toEqual('ws');
                } else {
                    expect(res.workspaceDirPath).toBeUndefined();
                }
                tempExternalDir && expect(res.tempDirPath).toEqual(tempExternalDir);
                if (!cleanUpTmp || tempExternalDir) {
                    expect(res.tempDirPath &&
                        fs.readFileSync(path.join(res.tempDirPath, 't.txt')).toString()
                    ).toEqual('temp');
                } else {
                    expect(res.tempDirPath).toBeUndefined();
                }
            } finally {
                for (let d of [tempExternalDir, wsExternalDir, res.workspaceDirPath, res.tempDirPath]) {
                    if (d && fs.existsSync(d)) {
                        fs.removeSync(d);
                    }
                }
            }
        }
    )

    test.each([
        undefined, '/github/home'
    ])(
        'should handle inputs and outputs, workingDir: %s',
        async workDir => {
            const res = await target.run(RunOptions.create()
                .setInputs({input1: 'abc', input2: 'def'})
                .setGithubContext({payload: {pull_request: {number: 123}}})
                .setWorkingDir(workDir)
                .setOutputOptions({printRunnerDebug: true})
            );
            expect(res.commands.outputs).toEqual({
                out1: 'abc',
                out2: 'def',
                pwd_out: workDir || DockerRunMilieuComponentsFactory.DIRS_MOUNTING_POINTS.workspace,
                workspace_out: DockerRunMilieuComponentsFactory.DIRS_MOUNTING_POINTS.workspace,
                out_pr_num: '123'
            });
            expect(res.commands.addedPaths).toEqual(['my_path']);
            expect(res.commands.exportedVars).toEqual({
                var1: 'val1',
                var2: 'val2'
            });
        });

    jest.setTimeout(10000);
    test.each([
        [900, 'sleep', false, true],
        [undefined, undefined, true, false],
    ])(
        'should respect %s timeout',
        async (timeoutMs, actionInput, expectSuccess, expectTimedOut) => {

            const res = await target.run(RunOptions.create()
                .setOutputOptions({printRunnerDebug: timeoutMs === undefined})
                .setInputs({action: actionInput})
                .setTimeoutMs(timeoutMs)
            );
            if (actionInput === 'sleep' && timeoutMs) {
                expect(res.durationMs).toBeGreaterThanOrEqual(timeoutMs);
            }
            expect(res.isSuccess).toEqual(expectSuccess);
            expect(res.isTimedOut).toEqual(expectTimedOut);
        });

    const runUnderCurrentLinuxUserCases = [false];
    if (os.platform() === 'linux') {
        runUnderCurrentLinuxUserCases.push(true);
    }
    test.each(runUnderCurrentLinuxUserCases)(
        'should run with runUnderCurrentLinuxUser: %s',
        async runUnderCurrentLinuxUser => {
            const res = await RunTarget.dockerAction(
                dockerActionYml, { runUnderCurrentLinuxUser: runUnderCurrentLinuxUser }
            ).run(RunOptions.create()
                .setInputs({input1: 'abc', action: 'user_out'})
            );
            expect(res.isSuccess).toEqual(true);
            const expectedUser = runUnderCurrentLinuxUser
                ? `${os.userInfo().uid}:${os.userInfo().gid}`
                : '0:0';
            expect(res.commands.outputs.user_out).toEqual(expectedUser);
        });

    it('should handle build error', async () => {
        const res = await RunTarget
            .dockerAction('tests/integration/testActions/dockerActionInvalid/action.yml')
            .run(RunOptions.create().setOutputOptions({printRunnerDebug: false}));
        expect(res.error).not.toBeUndefined();
        expect(res.exitCode).not.toEqual(0);
        expect(res.stderr).toBeUndefined();
        expect(res.stdout).toBeUndefined();
        expect(res.isSuccessBuild).toEqual(false);
        expect(res.isSuccess).toEqual(false);
        expect(res.isTimedOut).toEqual(false);
        expect(res.buildSpawnResult).not.toBeUndefined();
        expect(res.spawnResult).toBeUndefined();
    });

    it('should handle run error', async () => {
        const res = await target.run(RunOptions.create()
            .setOutputOptions({printRunnerDebug: false})
            .setInputs({input1: 'abc', action: 'fail'})
        );
        expect(res.error).toBeUndefined();
        expect(res.exitCode).toEqual(2);
        expect(res.stderr).not.toBeUndefined();
        expect(res.stderr).toEqual('');
        expect(res.stdout).not.toBeUndefined();
        expect(res.isSuccessBuild).toEqual(true);
        expect(res.isSuccess).toEqual(false);
        expect(res.isTimedOut).toEqual(false);
        expect(res.spawnResult).not.toBeUndefined();
        expect(res.commands.outputs).toEqual({out1: 'abc'})
    });

    it('should access host', async () => {
        const port = 8234;
        const server = http.createServer((req, res) => {
            if (req.url === '/repos/cardinalby/github-action-ts-run-api/releases') {
                res.writeHead(200);
                res.end('fake_response');
            } else {
                res.writeHead(404);
                res.end();
            }
        }).listen(port);

        try {
            // noinspection HttpUrlsUsage
            const res = await RunTarget.dockerFile(
                'tests/integration/testActions/dockerNetwork/action/Dockerfile'
            ).run(RunOptions.create()
                .setGithubContext({apiUrl: `http://${getDockerHostName()}:${port}`})
            );
            expect(res.isSuccess).toEqual(true);
            expect(res.commands.outputs.response).toEqual('fake_response');
        } finally {
            server.close();
        }
    });

    it('should access another container', async () => {
        await withDockerCompose(
            'tests/integration/testActions/dockerNetwork/docker-compose.yml',
            async () =>
            {
                const network = 'testNet';
                const serverContainer = 'fake-server';
                // noinspection HttpUrlsUsage
                const res = await RunTarget.dockerFile(
                    'tests/integration/testActions/dockerNetwork/action/Dockerfile',
                    undefined,
                    {network: network}
                ).run(RunOptions.create()
                    .setGithubContext({apiUrl: `http://${serverContainer}:80`})
                );
                expect(res.isSuccess).toEqual(true);
                expect(res.commands.outputs.response).toEqual('fake_response');
            });
    });
});