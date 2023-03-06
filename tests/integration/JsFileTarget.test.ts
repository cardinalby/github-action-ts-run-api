// noinspection ES6PreferShortImport

import * as inspector from "inspector";
import {RunOptions} from "../../src/runOptions/RunOptions";
import * as path from "path";
import {deleteAllFakedDirs, DeprecatedNodeVersionWarning, JsFileRunResultInterface, RunTarget} from "../../src";
import * as http from "http";
import {OutputTransform} from "../../src/runOptions/OutputTransform";
import {StdoutInterceptor} from "../../src/actionRunner/fn/runMilieu/StdoutInterceptor";
import {expectDeprecatedCmdsWarnings} from "../utils/warnings";
import {StdoutCommandName} from "../../src/stdout/stdoutCommands";

const actionYml = 'action.yml'
const complexActionDir = 'tests/integration/testActions/complex/';
const complexActionActionYml = complexActionDir + actionYml;
const node12ActionDir = 'tests/integration/testActions/node12/';
const node12ActionActionYml = node12ActionDir + actionYml

describe('JsActionScriptTarget', () => {
    afterEach(() => {
        deleteAllFakedDirs();
    });

    it('should run main script', async () => {
        const interceptor = StdoutInterceptor.start(true, OutputTransform.NONE, true, OutputTransform.NONE);
        let res: JsFileRunResultInterface;
        try {
            res = await RunTarget.mainJs(complexActionActionYml)
                .run(RunOptions.create()
                    .setEnv({MY_ENV_VAR: 'my_env_value'})
                    .setInputs({sendFileCommands: 'false', setState: 'stateVal'})
                    .setFakeFsOptions({fakeCommandFiles: false})
                    .setOutputOptions({
                        printStdout: true,
                        printStderr: true,
                        stdoutTransform: OutputTransform.SANITIZE_COMMANDS,
                        stderrTransform: OutputTransform.SANITIZE_COMMANDS,
                        printWarnings: false
                    })
                );
            await new Promise(resolve => setTimeout(resolve, 0));
        } finally {
            interceptor.unHook();
        }
        expect(res.commands.errors).toEqual(['err%msg1', 'err%msg2']);
        expect(res.commands.warnings).toEqual(["warning\rmsg"]);
        expect(res.commands.notices).toEqual(['notice:msg1', 'notice:msg2']);
        expect(res.commands.debugs).toEqual(['my_env_value', 'debug_msg2']);
        expect(res.commands.outputs).toEqual({
            'out1': 'out1_val',
            'out2': 'out2_val',
            'out3': 'out3_val',
            'out4': 'out4_val',
        });
        expect(res.commands.secrets).toEqual(['secret1', 'secret2']);
        expect(res.commands.echo).toEqual('on');
        expect(res.commands.savedState).toEqual({my_state: 'stateVal'});
        expect(res.commands.addedPaths).toEqual([]);
        expect(res.commands.exportedVars).toEqual({});
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false)
        expect(res.isSuccess).toEqual(true);

        const expectedDeprecatedCmds =
            [StdoutCommandName.SAVE_STATE, StdoutCommandName.SET_OUTPUT]
        expect(res.warnings).toHaveLength(expectedDeprecatedCmds.length);
        expectDeprecatedCmdsWarnings(res.warnings, expectedDeprecatedCmds);

        expect(interceptor.interceptedStdout.includes('::')).toEqual(false);
        expect(interceptor.interceptedStdout.includes('⦂⦂')).toEqual(true);
        expect(interceptor.interceptedStderr.includes('::')).toEqual(false);
        expect(interceptor.interceptedStderr.includes('⦂⦂')).toEqual(true);
    });

    it('should respect timeout', async () => {
        const options = RunOptions.create()
            .setInputs({sendStdoutCommands: 'true', sendFileCommands: 'false', delayMs: '500'})
            .setFakeFsOptions({fakeCommandFiles: false})
            .setTimeoutMs(400)
        const target = RunTarget.mainJs(complexActionActionYml);
        const res = await target.run(options);
        if (!inspector.url()) {
            expect(res.durationMs).toBeGreaterThanOrEqual(350);
        }
        expect(res.commands.errors).toEqual([]);
        expect(res.commands.warnings).toEqual([]);
        expect(res.commands.notices).toEqual([]);
        expect(res.commands.debugs).toEqual([]);
        expect(res.commands.outputs).toEqual({});
        expect(res.commands.secrets).toEqual([]);
        expect(res.commands.echo).toBeUndefined();
        expect(res.commands.savedState).toEqual({});
        expect(res.commands.addedPaths).toEqual([]);
        expect(res.commands.exportedVars).toEqual({});
        expect(res.error).not.toBeUndefined();
        expect(res.isTimedOut).toEqual(true);
        expect(res.isSuccess).toEqual(false);
        expect(res.warnings).toHaveLength(0);
    });

    it('should handle fail', async () => {
        const res = await RunTarget.mainJs(complexActionActionYml).run(
            RunOptions.create()
                .setInputs({sendStdoutCommands: 'true', sendFileCommands: 'true', failAtTheEnd: 'true'})
                .setFakeFsOptions({fakeCommandFiles: false})
                .setOutputOptions({printWarnings: false})
        );
        expect(res.commands.errors).toEqual(['err%msg1', 'err%msg2', 'failed_msg']);
        expect(res.commands.warnings).toEqual(["warning\rmsg"]);
        expect(res.commands.notices).toEqual(['notice:msg1', 'notice:msg2']);
        expect(res.commands.debugs).toEqual(['debug_msg2']);
        expect(res.commands.outputs).toEqual({
            'out1': 'out1_val',
            'out2': 'out2_val',
            'out3': 'out3_val',
            'out4': 'out4_val',
        });
        expect(res.commands.secrets).toEqual(['secret1', 'secret2']);
        expect(res.commands.echo).toEqual('on');
        expect(res.commands.savedState).toEqual({});
        expect(res.commands.addedPaths).toEqual(['my_path1', 'my_path2']);
        expect(res.commands.exportedVars).toEqual({
            my_env_var1: 'my_env_var_value1',
            my_env_var2: 'my_env_var_value2'
        });
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(false);
        expect(res.exitCode).toEqual(1);
        expect(res.spawnResult.status).toEqual(1);

        const expectedDeprecatedCmds =
            [StdoutCommandName.ADD_PATH, StdoutCommandName.SET_OUTPUT, StdoutCommandName.SET_ENV]
        expect(res.warnings).toHaveLength(expectedDeprecatedCmds.length);
        expectDeprecatedCmdsWarnings(res.warnings, expectedDeprecatedCmds);
    });

    it('should run post script', async () => {
        const res = await RunTarget.postJs(complexActionActionYml).run(
            RunOptions.create()
                .setEnv({NODE_PATH: process.env.NODE_PATH})
                .setOutputOptions({printRunnerDebug: true})
                .setInputs({sendFileCommands: 'true'})
                .setState({my_state: 'some%Val'})
                .setFakeFsOptions({fakeCommandFiles: false})
        );
        expect(res.commands.warnings).toEqual([path.resolve(process.cwd())]);
        expect(res.commands.debugs).toEqual(['post_script_debug']);
        expect(res.commands.notices).toEqual(['some%Val']);
        expect(res.commands.savedState).toEqual({});
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false);
        expect(res.isSuccess).toEqual(true);
        expect(res.warnings).toHaveLength(0);
    });

    it('should mock octokit', async () => {
        const server = http.createServer((req, res) => {
            if (req.url === '/repos/o/r') {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('{"name":"x"}');
            } else {
                res.writeHead(404);
                res.end();
            }
        }).listen(8234);

        try {
            const res = await RunTarget.preJs(complexActionActionYml).run(
                RunOptions.create()
                    .setGithubContext({apiUrl: 'http://localhost:8234'})
                    .setEnv({GITHUB_TOKEN: 't'})
            );
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(true);
            expect(res.commands.outputs).toEqual({resp: '{"name":"x"}'});
            expect(res.warnings).toHaveLength(0);
        } finally {
            server.close();
        }
    });
});

describe('JsFilePathTarget', () => {
    afterEach(() => {
        deleteAllFakedDirs();
    });

    test.each([true, false])(
        'should run targetJsFilePath, fakeFileCommands: %s',
        async fakeFileCommands => {
            const res = await RunTarget.jsFile(complexActionDir + 'main.js').run(
                RunOptions.create()
                    .setInputs({sendFileCommands: 'true', sendStdoutCommands: 'false', failAtTheEnd: 'false'})
                    .setFakeFsOptions({fakeCommandFiles: fakeFileCommands})
                    .setOutputOptions({printWarnings: fakeFileCommands})
            );
            expect(res.commands.errors).toEqual([]);
            expect(res.commands.warnings).toEqual([]);
            expect(res.commands.notices).toEqual([]);
            expect(res.commands.debugs).toEqual([]);
            expect(res.commands.outputs).toEqual({});
            expect(res.commands.secrets).toEqual([]);
            expect(res.commands.echo).toBeUndefined();
            expect(res.commands.addedPaths).toEqual(['my_path1', 'my_path2']);
            expect(res.commands.exportedVars).toEqual({
                my_env_var1: 'my_env_var_value1',
                my_env_var2: 'my_env_var_value2'
            });
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(true);

            const expectedDeprecatedCmds = fakeFileCommands
                ? []
                : [StdoutCommandName.ADD_PATH, StdoutCommandName.SET_ENV];
            expect(res.warnings).toHaveLength(expectedDeprecatedCmds.length);
            expectDeprecatedCmdsWarnings(res.warnings, expectedDeprecatedCmds);
        });

    test.each([
        [ true,  true,  ['w'], ['ppp'] ],
        [ true,  false, ['w'], ['ppp'] ],
        [ false, true,  [],    ['ppp'] ],
        [ false, false, [],    []      ]
    ])(
        'should respect parseStdoutCommands: %s, fakeFileCommands: %s options',
        async (parseStdoutCommands, fakeFileCommands, expectedWarnings, expectedPath) =>
        {
            const res = await RunTarget.jsFile(complexActionDir + 'parseStdCommandsTest.js').run(
                RunOptions.create()
                    .setFakeFsOptions({fakeCommandFiles: fakeFileCommands})
                    .setOutputOptions({
                        parseStdoutCommands: parseStdoutCommands,
                        printWarnings: fakeFileCommands || !parseStdoutCommands
                    })
            );
            expect(res.commands.warnings).toEqual(expectedWarnings);
            expect(res.commands.addedPaths).toEqual(expectedPath);
            expect(res.commands.exportedVars).toEqual({});
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(true);
            const expectedDeprecatedCmds = fakeFileCommands || !parseStdoutCommands
                ? []
                : [StdoutCommandName.ADD_PATH];
            expect(res.warnings).toHaveLength(expectedDeprecatedCmds.length);
            expectDeprecatedCmdsWarnings(res.warnings, expectedDeprecatedCmds);
        }
    );

    test.each([
        [undefined,            path.resolve(process.cwd()), complexActionDir + 'post.js'],
        [path.resolve('docs'), path.resolve('docs'),        complexActionDir + 'post.js']
    ])(
        'should set working directory %s',
        async (workingDir, resultCwd, jsFilePath) => {
            const res = await RunTarget.jsFile(jsFilePath).run(
                RunOptions.create()
                    .setWorkingDir(workingDir)
                    .setInputs({sendFileCommands: 'false'})
                    .setFakeFsOptions({fakeCommandFiles: false})
            );
            expect(res.commands.warnings).toEqual([resultCwd]);
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(true);
            expect(res.warnings).toHaveLength(0);
        });

    it('should run node12 action main script', async () => {
        const res = await RunTarget.mainJs(node12ActionActionYml)
            .run(RunOptions.create()
                .setInputs({setState: 'stateVal'})
                .setOutputOptions({
                    printWarnings: false
                })
            );
        expect(res.commands.warnings).toEqual([]);
        expect(res.commands.savedState).toEqual({my_state: 'stateVal'});
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false)
        expect(res.isSuccess).toEqual(true);
        expect(res.warnings).toHaveLength(1);
        expect(res.warnings[0]).toBeInstanceOf(DeprecatedNodeVersionWarning);
    });
});