// noinspection ES6PreferShortImport

import * as inspector from "inspector";
import {RunOptions} from "../../src/runOptions/RunOptions";
import * as path from "path";
import {JsFileRunResultInterface, RunTarget} from "../../src";
import http from "http";
import {OutputTransform} from "../../src/runOptions/OutputTransform";
import {StdoutInterceptor} from "../../src/actionRunner/fn/runMilieu/StdoutInterceptor";

const complexActionDir = 'tests/integration/testActions/complex/';
const complexActionActionYml = complexActionDir + 'action.yml';

describe('JsActionScriptTarget', () => {
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
                        stderrTransform: OutputTransform.SANITIZE_COMMANDS
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
            // TODO: Undocumented, but GitHub also parses stderr and looks for commands
        });
        expect(res.commands.secrets).toEqual(['secret1', 'secret2']);
        expect(res.commands.echo).toEqual('on');
        expect(res.commands.savedState).toEqual({my_state: 'stateVal'});
        expect(res.commands.addedPaths).toEqual([]);
        expect(res.commands.exportedVars).toEqual({});
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false)
        expect(res.isSuccess).toEqual(true);

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
    });

    it('should handle fail', async () => {
        const res = await RunTarget.mainJs(complexActionActionYml).run(
            RunOptions.create()
                .setInputs({sendStdoutCommands: 'true', sendFileCommands: 'true', failAtTheEnd: 'true'})
                .setFakeFsOptions({fakeCommandFiles: false})
        );
        expect(res.commands.errors).toEqual(['err%msg1', 'err%msg2', 'failed_msg']);
        expect(res.commands.warnings).toEqual(["warning\rmsg"]);
        expect(res.commands.notices).toEqual(['notice:msg1', 'notice:msg2']);
        expect(res.commands.debugs).toEqual(['debug_msg2']);
        expect(res.commands.outputs).toEqual({'out1': 'out1_val', 'out2': 'out2_val', 'out3': 'out3_val'});
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
        } finally {
            server.close();
        }
    });
});

describe('JsFilePathTarget', () => {
    test.each([true, false])(
        'should run targetJsFilePath, fakeFileCommands: %s',
        async fakeFileCommands => {
            const res = await RunTarget.jsFile(complexActionDir + 'main.js').run(
                RunOptions.create()
                    .setInputs({sendFileCommands: 'true', sendStdoutCommands: 'false', failAtTheEnd: 'false'})
                    .setFakeFsOptions({fakeCommandFiles: fakeFileCommands})
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
                    .setOutputOptions({parseStdoutCommands: parseStdoutCommands})
            );
            expect(res.commands.warnings).toEqual(expectedWarnings);
            expect(res.commands.addedPaths).toEqual(expectedPath);
            expect(res.commands.exportedVars).toEqual({});
            expect(res.error).toBeUndefined();
            expect(res.isTimedOut).toEqual(false);
            expect(res.isSuccess).toEqual(true);
        }
    );

    test.each([
        [undefined, path.resolve(process.cwd()), complexActionDir + 'post.js'],
        [path.resolve(complexActionDir), path.resolve(complexActionDir), 'post.js']
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
        });
});