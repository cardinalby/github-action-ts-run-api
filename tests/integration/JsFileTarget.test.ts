// noinspection ES6PreferShortImport

import * as inspector from "inspector";
import {RunOptions} from "../../src/runOptions/RunOptions";
import * as path from "path";
import {JsActionScriptTarget} from "../../src/actionRunner/jsFile/runTarget/JsActionScriptTarget";
import {JsFilePathTarget} from "../../src/actionRunner/jsFile/runTarget/JsFilePathTarget";
import {Duration} from "../../src/utils/Duration";

const complexActionDir = 'tests/integration/testActions/complex/';
const complexActionActionYml = complexActionDir + 'action.yml';

describe('JsActionScriptTarget', () => {
    it('should run main script', () => {
        const res = JsActionScriptTarget.createMain(complexActionActionYml)
            .run(RunOptions.create()
                .addProcessEnv()
                .setEnv({MY_ENV_VAR: 'my_env_value'})
                .setInputs({sendFileCommands: 'false', setState: 'stateVal'})
                .setFakeFsOptions({fakeCommandFiles: false})
            );
        expect(res.commands.errors).toEqual(['err%msg1', 'err%msg2']);
        expect(res.commands.warnings).toEqual(["warning\rmsg"]);
        expect(res.commands.notices).toEqual(['notice:msg1', 'notice:msg2']);
        expect(res.commands.debugs).toEqual(['my_env_value', 'debug_msg2']);
        expect(res.commands.outputs).toEqual({'out1': 'out1_val', 'out2': 'out2_val', 'out3': 'out3_val'});
        expect(res.commands.secrets).toEqual(['secret1', 'secret2']);
        expect(res.commands.echo).toEqual('on');
        expect(res.commands.savedState).toEqual({my_state: 'stateVal'});
        expect(res.commands.addedPaths).toEqual([]);
        expect(res.commands.exportedVars).toEqual({});
        expect(res.error).toBeUndefined();
        expect(res.isTimedOut).toEqual(false)
        expect(res.isSuccess).toEqual(true);
    });

    it('should respect timeout', () => {
        const options = RunOptions.create()
            .addProcessEnv()
            .setInputs({sendStdoutCommands: 'true', sendFileCommands: 'false', delayMs: '500'})
            .setFakeFsOptions({fakeCommandFiles: false})
            .setTimeoutMs(400)
        const target = JsActionScriptTarget.createMain(complexActionActionYml);
        const duration = Duration.startMeasuring();
        const res = target.run(options);
        const executionMs = duration.measureMs();
        if (!inspector.url()) {
            expect(executionMs).toBeLessThan(500);
            expect(executionMs).toBeGreaterThanOrEqual(400);
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

    it('should handle fail', () => {
        const res = JsActionScriptTarget.createMain(complexActionActionYml).run(
            RunOptions.create()
                .addProcessEnv()
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

    it('should run post script', () => {
        const res = JsActionScriptTarget.createPost(complexActionActionYml).run(
            RunOptions.create()
                .addProcessEnv()
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
});

describe('JsFilePathTarget', () => {
    test.each([true, false])(
        'should run targetJsFilePath, file commands',
        fakeFileCommands => {
            const res = JsFilePathTarget.create(complexActionDir + 'main.js').run(
                RunOptions.create()
                    .addProcessEnv()
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
        (parseStdoutCommands, fakeFileCommands, expectedWarnings, expectedPath) =>
        {
            const res = JsFilePathTarget.create(complexActionDir + 'parseStdCommandsTest.js').run(
                RunOptions.create()
                    .addProcessEnv()
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
        'should set working directory',
        (workingDir, resultCwd, jsFilePath) => {
            const res = JsFilePathTarget.create(jsFilePath).run(
                RunOptions.create()
                    .addProcessEnv()
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