import * as core from "@actions/core";
import * as os from "os";
import {ProcessEnvVarsBackup} from "../utils/ProcessEnvVarsBackup";
import {ActionConfigInterface} from "../../src/types/ActionConfigInterface";
import {setOutput} from "@actions/core";
import {SyncFnTarget} from "../../src/actionRunner/fn/runTarget/SyncFnTarget";
import {RunOptions} from "../../src/runOptions/RunOptions";
import {AsyncFnTarget} from "../../src/actionRunner/fn/runTarget/AsyncFnTarget";
import * as path from "path";
import {GithubContextStore} from "../../src/stores/GithubContextStore";
import {GithubServiceEnvStore} from "../../src/stores/GithubServiceEnvStore";
import {getNewGithubContext} from "../utils/getNewGithubContext";
import {Duration} from "../../src/utils/Duration";
import {EnvInterface} from "../../src/types/EnvInterface";
import {Context} from "@actions/github/lib/context";
import assert from "assert";

const complexActionDir = 'tests/integration/testActions/complex/';
const complexActionActionYml = complexActionDir + 'action.yml';
const printStdout = process.env.CI === undefined;

describe('SyncFnTarget', () => {
    it('should restore process envs and exitCode', () => {
        const envBackup = ProcessEnvVarsBackup.safeSet({AAA: 'aaa'});
        try {
            const initialProcessCwd = process.cwd();
            const res = SyncFnTarget.create(() => {
                core.debug(process.env.CCC || '');
                process.env.BBB = 'bbb';
                process.env.AAA = 'ccc';
                process.exitCode = 1;
                process.chdir(path.join(process.cwd(), 'tests'));
                return 32;
            }).run(RunOptions.create({
                env: {CCC: 'x'},
                shouldPrintStdout: printStdout
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
        const options = RunOptions.create().setShouldPrintStdout(printStdout);
        const res = SyncFnTarget.create(() => {
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
        }).run(options);
        const commands = res.commands;
        expect(commands.errors).toEqual(['err%msg1', 'err%msg2']);
        expect(commands.warnings).toEqual(["warning\rmsg"]);
        expect(commands.notices).toEqual(['notice:msg1', 'notice:msg2']);
        expect(commands.debugs).toEqual(['debug_msg1', 'debug_msg2']);
        expect(commands.outputs).toEqual({'out1': 'out1_val', 'out2': 'out2_val', 'out3': 'out3_val'});
        expect(commands.secrets).toEqual(['secret1', 'secret2']);
        expect(commands.echo).toEqual('on');
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toBeUndefined();
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(true);
    });

    it('should set github service envs', async () => {
        const options = RunOptions.create().setShouldPrintStdout(printStdout);
        const res = await AsyncFnTarget.create(async () => {

            const context = getNewGithubContext();
            expect(context.runNumber).toEqual(8);
            expect(context.ref).toEqual('tag/myTag');
            expect(context.repo.owner).toEqual('ownerrr');
            expect(context.repo.repo).toEqual('repooo');
        }).run(options
            .setGithubServiceEnv({CI: 'false', GITHUB_REF_TYPE: 'tag'})
            .setGithubContext({runNumber: 8, ref: 'tag/myTag', repository: 'ownerrr/repooo'})
        );
        expect(res.isSuccess).toEqual(true);
    });

    it('should fake github service envs', async () => {
        const options = RunOptions.create().setShouldPrintStdout(printStdout);
        let fnEnv: EnvInterface = {};
        let fnContext: Context|undefined;
        const res = await AsyncFnTarget.create(async () => {
            fnContext = getNewGithubContext();
            fnEnv = process.env;
        }, complexActionActionYml).run(options
            .setShouldFakeMinimalGithubRunnerEnv(true)
        );
        expect(res.isSuccess).toEqual(true);
        expect(fnContext).not.toBeUndefined();
        assert(fnContext);
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
        [ true,  true,  ['w'], ['ppp'] ],
        [ true,  false, ['w'], ['ppp'] ],
        [ false, true,  [],    ['ppp'] ],
        [ false, false, [],    []      ]
    ])(
        'should respect parseStdoutCommands option',
        (parseStdoutCommands, fakeFileCommands, expectedWarnings, expectedPath) =>
        {
            const res = SyncFnTarget.create(() => {
                core.warning('w');
                core.addPath('ppp');
                return 4;
            }).run(RunOptions.create()
                .setShouldParseStdout(parseStdoutCommands)
                .setFakeFileOptions({fakeCommandFiles: fakeFileCommands})
                .setShouldPrintStdout(printStdout)
            );
            expect(res.commands.warnings).toEqual(expectedWarnings);
            expect(res.commands.addedPaths).toEqual(expectedPath);
            expect(res.commands.exportedVars).toEqual({});
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
            .setShouldPrintStdout(printStdout);
        const res = SyncFnTarget.create(() => {
            expect(core.getInput('INPUT1')).toEqual('val1');
            expect(core.getBooleanInput('input2')).toEqual(true);
            expect(core.getInput('input3')).toEqual('default3');
            expect(core.getInput('input4')).toEqual('');
            setOutput('out1', 'val1');
        }, actionConfig).run(options);
        expect(res.commands.outputs.out1).toEqual('val1');
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toBeUndefined();
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(true);
    });

    it('should parse deprecated commands from stdout', () => {
        const envBackup = ProcessEnvVarsBackup.safeSet({
            GITHUB_PATH: '',
            GITHUB_ENV: ''
        });
        const res = SyncFnTarget.create(() => {
            core.addPath('my_path1');
            core.addPath('my_path2');
            core.exportVariable('my_env_var1', 'my_env_var_value1');
            core.exportVariable('my_env_var2', 'my_env_var_value2');
        }).run(
            RunOptions.create()
                .setFakeFileOptions({fakeCommandFiles: false})
                .setShouldPrintStdout(printStdout)
        );
        envBackup.restore();
        const commands = res.commands;
        expect(commands.addedPaths).toEqual(['my_path1', 'my_path2']);
        expect(commands.exportedVars).toEqual({
            'my_env_var1': 'my_env_var_value1',
            'my_env_var2': 'my_env_var_value2'
        });
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toBeUndefined();
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(true);
    });

    it('should parse file commands', () => {
        const res = SyncFnTarget.create(() => {
            core.addPath('my_path1');
            core.addPath('my_path2');
            core.exportVariable('my_env_var1', 'my_env_%var_value1');
            core.exportVariable('my_env_var2', "my_env_\nvar_value2");
        }).run(RunOptions.create().setShouldPrintStdout(printStdout));
        const commands = res.commands;
        expect(commands.addedPaths).toEqual(['my_path1', 'my_path2']);
        expect(commands.exportedVars).toEqual({
            'my_env_var1': 'my_env_%var_value1',
            'my_env_var2': "my_env_\nvar_value2"
        });
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toBeUndefined();
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(true);
    });

    it('should handle fn error', () => {
        const res = SyncFnTarget.create(() => {
            core.error('err%msg1');
            core.error('err%msg2');
            core.warning('warning_msg');
            core.addPath('my_path1');
            throw new Error('abc');
        }).run(RunOptions.create().setShouldPrintStdout(printStdout));
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

async function waitFor(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('AsyncFnTarget', () => {
    it('should restore process envs and exitCode async', async () => {
        process.env.AAA = 'aaa';
        const target = AsyncFnTarget.create(async () => {
            core.debug(process.env.CCC || '');
            process.env.BBB = 'bbb';
            process.env.AAA = 'ccc';
            await waitFor(30);
            process.exitCode = 1;
            return 32;
        })
        const duration = Duration.startMeasuring();
        const resPromise = target.run(RunOptions.create({
            env: {CCC: 'x'},
            timeoutMs: 1200,
            shouldPrintStdout: printStdout
        }));
        expect(process.env.AAA).toEqual('ccc');
        expect(process.exitCode).toBeUndefined();
        expect(process.env.BBB).toEqual('bbb');
        expect(process.env.CCC).toEqual('x');
        const res = await resPromise;
        expect(duration.measureMs()).toBeGreaterThanOrEqual(30);
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
        const res = await AsyncFnTarget.create(async () => {
            await waitFor(1);
            core.error('err%msg1');
            core.error('err%msg2');
            core.warning('warning_msg');
            core.addPath('my_path1');
            throw new Error('abc');
        }).run(RunOptions.create().setShouldPrintStdout(printStdout));
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
        const res = await AsyncFnTarget.create(async () => {
            core.warning('warning_msg');
            await waitFor(200);
            return 5;
        }).run(RunOptions.create()
            .setTimeoutMs(100)
            .setShouldPrintStdout(printStdout)
        );
        expect(res.commands.warnings).toEqual(["warning_msg"]);
        expect(res.exitCode).toBeUndefined();
        expect(res.fnResult).toEqual(5);
        expect(res.error).toBeUndefined();
        expect(res.isSuccess).toEqual(true);
        expect(res.isTimedOut).toEqual(true);
    });
});