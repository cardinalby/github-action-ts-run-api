// noinspection ES6PreferShortImport

import * as core from "@actions/core";
import * as os from "os";
import {ProcessEnvVarsBackup} from "../utils/ProcessEnvVarsBackup";
import {ActionConfigInterface} from "../../src/types/ActionConfigInterface";
import {RunOptions} from "../../src/runOptions/RunOptions";
import * as path from "path";
import {GithubContextStore} from "../../src/runOptions/GithubContextStore";
import {GithubServiceEnvStore} from "../../src/runOptions/GithubServiceEnvStore";
import {EnvInterface} from "../../src/types/EnvInterface";
import {Context} from "@actions/github/lib/context";
import fs from "fs-extra";
import tmp from "tmp";
import {deleteAllFakedDirs} from "../../src/githubServiceFiles/runnerDir/FakeRunnerDir";
import {RunTarget} from "../../src";
import {waitFor} from "../utils/waitFor";
import {OutputTransform} from "../../src/runOptions/OutputTransform";
import {StdoutInterceptor} from "../../src/actionRunner/fn/runMilieu/StdoutInterceptor";

const complexActionDir = 'tests/integration/testActions/complex/';
const complexActionActionYml = complexActionDir + 'action.yml';

describe('SyncFnTarget', () => {
    it('should restore process envs and exitCode', () => {
        const envBackup = ProcessEnvVarsBackup.safeSet({AAA: 'aaa'});
        try {
            const initialProcessCwd = process.cwd();
            const res = RunTarget.syncFn(() => {
                core.debug(process.env.CCC || '');
                process.env.BBB = 'bbb';
                process.env.AAA = 'ccc';
                process.exitCode = 1;
                process.chdir(path.join(process.cwd(), 'tests'));
                return 32;
            }).run(RunOptions.create({
                env: {CCC: 'x'}
            }));
            expect(process.cwd()).toEqual(initialProcessCwd);
            expect(process.env.AAA).toEqual('aaa');
            expect(process.exitCode).toBeUndefined();
            expect(process.env.BBB).toBeUndefined();
            expect(process.env.CCC).toBeUndefined();
            expect(res.commands.debugs).toEqual(['x']);
            expect(res.exitCode).toEqual(1);
            expect(res.fnResult).toEqual(32);
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(false);
        } finally {
            envBackup.restore();
        }
    });

    it('should parse stdout commands', () => {
        const options = RunOptions.create();
        const res = RunTarget.syncFn(() => {
            core.error('err%msg1');
            core.error('err%msg2');
            core.warning('warning\rmsg');
            core.notice('notice:msg1');
            core.notice('notice:msg2');
            core.setOutput('out1', 'out1_val');
            core.setOutput('out2', 'out2_val');
            core.debug('debug_msg1');
            core.info('info_msg');
            core.setSecret('secret1');
            core.setSecret('secret2');
            core.setCommandEcho(true);

            process.stdout.write('::set-output na');
            process.stdout.write('me=out3::out3_val' + os.EOL + '::debug::de');
            process.stdout.write('bug_msg2' + os.EOL);
            // Undocumented, but GitHub also parses stderr and looks for commands
            process.stderr.write('::set-output name=out4::out4_val' + os.EOL);
        }).run(options);
        const commands = res.commands;
        expect(commands.errors).toEqual(['err%msg1', 'err%msg2']);
        expect(commands.warnings).toEqual(["warning\rmsg"]);
        expect(commands.notices).toEqual(['notice:msg1', 'notice:msg2']);
        expect(commands.debugs).toEqual(['debug_msg1', 'debug_msg2']);
        expect(commands.outputs).toEqual({
            'out1': 'out1_val',
            'out2': 'out2_val',
            'out3': 'out3_val',
            'out4': 'out4_val'
        });
        expect(commands.secrets).toEqual(['secret1', 'secret2']);
        expect(commands.echo).toEqual('on');
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toBeUndefined();
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(true);
    });

    it('should transform stdout and stderr', async () => {
        const options = RunOptions.create({
            outputOptions: {
                printStdout: true,
                printStderr: true,
                stdoutTransform: OutputTransform.SANITIZE_COMMANDS,
                stderrTransform: OutputTransform.SANITIZE_COMMANDS,
            }
        });
        const interceptor = StdoutInterceptor.start(true, OutputTransform.NONE, true, OutputTransform.NONE);
        try {
            RunTarget.syncFn(() => {
                core.error('err%msg1');
                core.info('info_msg');
                process.stdout.write('::set-output na');
                process.stdout.write('me=out3::out3_val' + os.EOL);
                process.stderr.write('::set-output name=out4::out4_val' + os.EOL);
            }).run(options);
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(interceptor.interceptedStdout).toEqual(
                '⦂⦂error⦂⦂err%25msg1' + os.EOL +
                'info_msg' + os.EOL +
                '⦂⦂set-output name=out3⦂⦂out3_val' + os.EOL
            );
            expect(interceptor.interceptedStderr).toEqual('⦂⦂set-output name=out4⦂⦂out4_val' + os.EOL);
        } finally {
            interceptor.unHook();
        }
    });

    test.each([5, 6])('should set github service envs', async runNumber => {
        jest.resetModules();
        const options = RunOptions.create();
        let fnContext: Context = new Context();
        let fnRepo: any = undefined;
        const res = await RunTarget.asyncFn(async () => {
            fnContext = require('@actions/github').context;
            fnRepo = fnContext.repo;
        }).run(options
            .setGithubServiceEnv({CI: 'false', GITHUB_REF_TYPE: 'tag'})
            .setGithubContext({runNumber: runNumber, ref: 'tag/myTag', repository: 'ownerrr/repooo'})
        );
        expect(res.isSuccess).toEqual(true);
        expect(fnContext.runNumber).toEqual(runNumber);
        expect(fnContext.ref).toEqual('tag/myTag');
        expect(fnRepo.owner).toEqual('ownerrr');
        expect(fnRepo.repo).toEqual('repooo');
    });

    it('should fake github service envs', async () => {
        jest.resetModules();
        const options = RunOptions.create();
        let fnEnv: EnvInterface = {};
        let fnContext: Context = new Context();
        const res = await RunTarget.asyncFn(async () => {
            fnContext = require('@actions/github').context;
            fnEnv = process.env;
        }, complexActionActionYml).run(options
            .setShouldFakeMinimalGithubRunnerEnv(true)
        );
        expect(res.isSuccess).toEqual(true);
        expect(fnContext).not.toBeUndefined();
        expect(fnContext.action).toEqual('stdoutCommandsTestAction');
        expect(fnContext.workflow).toEqual(GithubContextStore.WORKFLOW_DEFAULT);
        expect(fnContext.runId).toBeGreaterThan(0);
        expect(fnContext.runNumber).toEqual(GithubContextStore.RUN_NUMBER_DEFAULT);
        expect(fnContext.job).toEqual(GithubContextStore.JOB_DEFAULT);
        expect(fnContext.actor).toEqual(GithubContextStore.ACTOR_DEFAULT);
        expect(fnContext.eventName).toEqual(GithubContextStore.EVENT_NAME_DEFAULT);
        expect(fnContext.serverUrl).toEqual(GithubContextStore.SERVER_URL_DEFAULT);
        expect(fnContext.apiUrl).toEqual(GithubContextStore.API_URL_DEFAULT);
        expect(fnContext.graphqlUrl).toEqual(GithubContextStore.GRAPHQL_URL_DEFAULT);
        expect(fnEnv.GITHUB_ACTION_PATH).toEqual(undefined);
        expect(fnEnv.CI).toEqual(GithubServiceEnvStore.CI_DEFAULT);
        expect(fnEnv.GITHUB_ACTIONS).toEqual(GithubServiceEnvStore.GITHUB_ACTIONS_DEFAULT);
        expect(fnEnv.RUNNER_NAME).toEqual(GithubServiceEnvStore.RUNNER_NAME_DEFAULT);
        expect(fnEnv.RUNNER_OS).toMatch(/^Linux|Windows|macOS$/);
        expect(fnEnv.RUNNER_ARCH).toMatch(/^X86|X64|ARM|ARM64$/);
    });

    test.each([
        [ true,  true,  ['w'], ['ppp'], {v1: '1\n1', v2: '2\n2', v3: '3', v4: '4'} ],
        [ true,  false, ['w'], ['ppp'], {v1: '1\n1', v2: '2\n2', v3: '3', v4: '4'} ],
        [ false, true,  [],    ['ppp'], {v1: '1\n1', v2: '2\n2', v3: '3', v4: '4'} ],
        [ false, false, [],    [],      {}]
    ])(
        'should respect parseStdoutCommands: %s, fakeFileCommands: %s',
        (parseStdoutCommands, fakeFileCommands, expectedWarnings, expectedPath, expectedExportedVars) =>
        {
            const res = RunTarget.syncFn(() => {
                core.warning('w');
                core.addPath('ppp');
                core.exportVariable('v1', '1\n1');
                if (process.env.GITHUB_ENV) {
                    fs.appendFileSync(process.env.GITHUB_ENV, ['v2<<ddd', '2\n2', 'ddd' + os.EOL].join(os.EOL));
                    fs.appendFileSync(process.env.GITHUB_ENV, 'v4=4' + os.EOL);
                } else {
                    core.exportVariable('v2', '2\n2');
                    core.exportVariable('v4', '4');
                }
                core.exportVariable('v3', '3');
                return 4;
            }).run(RunOptions.create()
                .setOutputOptions({parseStdoutCommands: parseStdoutCommands})
                .setFakeFsOptions({fakeCommandFiles: fakeFileCommands})
            );
            expect(res.commands.warnings).toEqual(expectedWarnings);
            expect(res.commands.addedPaths).toEqual(expectedPath);
            expect(res.commands.exportedVars).toEqual(expectedExportedVars);
            expect(res.exitCode).toBeUndefined();
            expect(res.fnResult).toEqual(4);
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(true);
        }
    );

    it('should combine inputs', () => {
        const actionConfig: ActionConfigInterface = {
            name: '',
            description: '',
            inputs: {
                input1: {
                    description: 'i1',
                    required: false,
                    default: 'default1'
                },
                input2: {
                    description: 'i2',
                    required: true
                },
                input3: {
                    description: 'i3',
                    required: false,
                    default: 'default3'
                },
                input4: {
                    description: 'i4',
                    required: false
                }
            },
            runs: {
                using: 'node16',
                main: 'main.js',
            }
        }
        const options = RunOptions.create()
            .setInputs({
                input1: 'val1',
                input2: 'true',
            })
            ;
        const res = RunTarget.syncFn(() => {
            expect(core.getInput('INPUT1')).toEqual('val1');
            expect(core.getBooleanInput('input2')).toEqual(true);
            expect(core.getInput('input3')).toEqual('default3');
            expect(core.getInput('input4')).toEqual('');
            core.setOutput('out1', 'val1');
        }, actionConfig).run(options);
        expect(res.commands.outputs.out1).toEqual('val1');
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toBeUndefined();
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(true);
    });

    test.each([
        [ true,  true , undefined, undefined ],
        [ true,  false, undefined, undefined ],
        [ false, true , undefined, undefined ],
        [ false, false, undefined, undefined ],
        [ true,  true , 'tmp', 'tmp' ],
        [ true,  false, 'tmp', 'tmp' ],
        [ false, true , 'tmp', 'tmp' ],
        [ false, false, 'tmp', 'tmp' ]
    ])(
        'should handle cleanUpTemp: %s, cleanUpWorkspace: %s, wsExternalDir: %s, tempExternalDir: %s',
        (cleanUpTemp, cleanUpWorkspace, wsExternalDir, tempExternalDir) => {
            if (wsExternalDir === 'tmp') {
                wsExternalDir = tmp.dirSync({keep: true}).name;
            }
            if (tempExternalDir === 'tmp') {
                tempExternalDir = tmp.dirSync({keep: true}).name;
            }

            let wsFilePath: string;
            let tempFilePath: string;

            const res = RunTarget.syncFn(() => {
                expect(
                    process.env.GITHUB_WORKSPACE !== undefined && fs.existsSync(process.env.GITHUB_WORKSPACE)
                ).toEqual(true);
                wsFilePath = path.join(process.env.GITHUB_WORKSPACE as string, 'w.txt');
                fs.writeFileSync(wsFilePath, 'ws');
                expect(
                    process.env.RUNNER_TEMP !== undefined && fs.existsSync(process.env.RUNNER_TEMP)
                ).toEqual(true);
                tempFilePath = path.join(process.env.RUNNER_TEMP as string, 't.txt');
                fs.writeFileSync(tempFilePath, 'temp');
            }).run(RunOptions.create()
                .setFakeFsOptions({
                    rmFakedWorkspaceDirAfterRun: cleanUpWorkspace,
                    rmFakedTempDirAfterRun: cleanUpTemp
                })
                .setTempDir(tempExternalDir)
                .setWorkspaceDir(wsExternalDir)
            );
            try {
                expect(res.isSuccess).toEqual(true);
                wsExternalDir && expect(res.workspaceDirPath).toEqual(wsExternalDir);

                let tempWorkspaceDir: string|undefined = undefined;
                if (!cleanUpWorkspace || wsExternalDir) {
                    tempWorkspaceDir = res.workspaceDirPath;
                    expect(res.workspaceDirPath &&
                        fs.readFileSync(path.join(res.workspaceDirPath, 'w.txt')).toString()
                    ).toEqual('ws');
                } else {
                    expect(res.workspaceDirPath).toBeUndefined();
                }

                tempExternalDir && expect(res.tempDirPath).toEqual(tempExternalDir);
                let tempTempDir: string|undefined = undefined;
                if (!cleanUpTemp || tempExternalDir) {
                    tempTempDir = res.tempDirPath;
                    expect(res.tempDirPath &&
                        fs.readFileSync(path.join(res.tempDirPath, 't.txt')).toString()
                    ).toEqual('temp');
                } else {
                    expect(res.tempDirPath).toBeUndefined();
                }

                res.cleanUpFakedDirs();

                if (!tempExternalDir && !cleanUpTemp && tempTempDir) {
                    expect(fs.existsSync(tempTempDir)).toEqual(false);
                    expect(res.tempDirPath).toBeUndefined();
                }
                if (!wsExternalDir && !cleanUpWorkspace && tempWorkspaceDir) {
                    expect(fs.existsSync(tempWorkspaceDir)).toEqual(false);
                    expect(res.workspaceDirPath).toBeUndefined();
                }
            } finally {
                for (let d of [tempExternalDir, wsExternalDir, res.workspaceDirPath, res.tempDirPath]) {
                    if (d && fs.existsSync(d)) {
                        fs.removeSync(d);
                    }
                }
            }
    });

    it('should delete all global faked dirs', () => {
        const res = RunTarget.syncFn(() => {}).run(RunOptions.create()
            .setFakeFsOptions({rmFakedWorkspaceDirAfterRun: false, rmFakedTempDirAfterRun: false})
        );
        const res2 = RunTarget.syncFn(() => {}).run(RunOptions.create()
            .setFakeFsOptions({rmFakedWorkspaceDirAfterRun: false, rmFakedTempDirAfterRun: false})
        );
        expect(res.tempDirPath && fs.existsSync(res.tempDirPath)).toEqual(true);
        expect(res.workspaceDirPath && fs.existsSync(res.workspaceDirPath)).toEqual(true);
        expect(res2.tempDirPath && fs.existsSync(res2.tempDirPath)).toEqual(true);
        expect(res2.workspaceDirPath && fs.existsSync(res2.workspaceDirPath)).toEqual(true);
        deleteAllFakedDirs();
        expect(res.tempDirPath).toEqual(undefined);
        expect(res.workspaceDirPath).toEqual(undefined);
        expect(res2.tempDirPath).toEqual(undefined);
        expect(res2.workspaceDirPath).toEqual(undefined);
    });

    it('should handle fn error', () => {
        const res = RunTarget.syncFn(() => {
            core.error('err%msg1');
            core.error('err%msg2');
            core.warning('warning_msg');
            core.addPath('my_path1');
            throw new Error('abc');
        }).run(RunOptions.create());
        const commands = res.commands;
        expect(commands.errors).toEqual(['err%msg1', 'err%msg2']);
        expect(commands.warnings).toEqual(["warning_msg"]);
        expect(commands.addedPaths).toEqual(['my_path1']);
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toBeUndefined();
        expect(res.error).not.toBeUndefined();
        expect(res.error?.message).toEqual('abc');
        expect(res.isSuccess).toEqual(false);
        expect(res.isTimedOut).toEqual(false);
    });
});

describe('AsyncFnTarget', () => {
    it('should restore process envs and exitCode async', async () => {
        process.env.AAA = 'aaa';
        const target = RunTarget.asyncFn(async () => {
            core.debug(process.env.CCC || '');
            process.env.BBB = 'bbb';
            process.env.AAA = 'ccc';
            await waitFor(30);
            process.exitCode = 1;
            return 32;
        })
        const resPromise = target.run(RunOptions.create({
            env: {CCC: 'x'},
            timeoutMs: 1200
        }));
        expect(process.env.AAA).toEqual('ccc');
        expect(process.exitCode).toBeUndefined();
        expect(process.env.BBB).toEqual('bbb');
        expect(process.env.CCC).toEqual('x');
        const res = await resPromise;
        expect(res.durationMs).toBeGreaterThanOrEqual(20);
        expect(process.env.AAA).toEqual('aaa');
        expect(process.exitCode).toBeUndefined();
        expect(process.env.BBB).toBeUndefined();
        expect(process.env.CCC).toBeUndefined();
        expect(res.commands.debugs).toEqual(['x']);
        expect(res.exitCode).toEqual(1);
        expect(res.fnResult).toEqual(32);
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(false);
    });

    it('should handle async fn error', async () => {
        const res = await RunTarget.asyncFn(async () => {
            await waitFor(1);
            core.error('err%msg1');
            core.error('err%msg2');
            core.warning('warning_msg');
            core.addPath('my_path1');
            throw new Error('abc');
        }).run(RunOptions.create());
        const commands = res.commands;
        expect(commands.errors).toEqual(['err%msg1', 'err%msg2']);
        expect(commands.warnings).toEqual(["warning_msg"]);
        expect(commands.addedPaths).toEqual(['my_path1']);
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toBeUndefined();
        expect(res.error).not.toBeUndefined();
        expect(res.error?.message).toEqual('abc');
        expect(res.isSuccess).toEqual(false);
        expect(res.isTimedOut).toEqual(false);
    });

    it('should handle async fn timeout', async () => {
        const res = await RunTarget.asyncFn(async () => {
            core.warning('warning_msg');
            await waitFor(200);
            return 5;
        }).run(RunOptions.create()
            .setTimeoutMs(100)
        );
        expect(res.commands.warnings).toEqual(["warning_msg"]);
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toEqual(5);
        expect(res.error).toBeUndefined();
        expect(res.isSuccess).toEqual(true);
        expect(res.isTimedOut).toEqual(true);
    });
});