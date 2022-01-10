import {TestLifecycleHelper} from "../../src";
import * as core from "@actions/core";
import * as os from "os";
import tmp from "tmp";
import fs from "fs-extra";
import {saveProcessProps} from "../../src";

describe('TestLifecycleHelper', () => {
    it('should restore process envs and exitCode', () => {
        const actionsTestHelper = new TestLifecycleHelper();
        process.env.AAA = 'aaa';
        actionsTestHelper.beforeTest();
        process.env.BBB = 'bbb';
        process.env.AAA = 'ccc';
        process.exitCode = 1;
        actionsTestHelper.afterTest();
        expect(process.env.AAA).toEqual('aaa');
        expect(process.exitCode).toEqual(0);
        expect(process.env.BBB).toBeUndefined();
        expect(() => {actionsTestHelper.afterTest()}).toThrow();
    });

    it('should parse stdout commands', () => {
        const actionsTestHelper = new TestLifecycleHelper();
        actionsTestHelper.beforeTest();
        core.error('err%msg1');
        core.error('err%msg2');
        core.warning('warning\rmsg');
        core.notice('notice:msg1');
        core.notice('notice:msg2');
        core.setOutput('out1','out1_val');
        core.setOutput('out2','out2_val');
        core.debug('debug_msg1');
        core.info('info_msg');
        core.setSecret('secret1');
        core.setSecret('secret2');
        core.setCommandEcho(true);

        process.stdout.write('::set-output na');
        process.stdout.write('me=out3::out3_val' + os.EOL + '::debug::de');
        process.stdout.write('bug_msg2' + os.EOL);
        const commands = actionsTestHelper.collectedCommands;
        expect(commands.errors).toEqual(['err%msg1', 'err%msg2']);
        expect(commands.warnings).toEqual(["warning\rmsg"]);
        expect(commands.notices).toEqual(['notice:msg1', 'notice:msg2']);
        expect(commands.debugs).toEqual(['debug_msg1', 'debug_msg2']);
        expect(commands.outputs).toEqual({'out1': 'out1_val', 'out2': 'out2_val', 'out3': 'out3_val'});
        expect(commands.secrets).toEqual(['secret1', 'secret2']);
        expect(commands.echo).toEqual('on');
        actionsTestHelper.afterTest();
        expect(() => actionsTestHelper.collectedCommands).toThrow();
    });

    it('should parse deprecated commands from stdout', () => {
        const actionsTestHelper = new TestLifecycleHelper();
        const restoreProcessProps = saveProcessProps();
        process.env.GITHUB_PATH = '';
        process.env.GITHUB_ENV = '';
        try {
            actionsTestHelper.beforeTest();
            core.addPath('my_path1');
            core.addPath('my_path2');
            core.exportVariable('my_env_var1', 'my_env_var_value1');
            core.exportVariable('my_env_var2', 'my_env_var_value2');
            const commands = actionsTestHelper.collectedCommands;
            expect(commands.addedPaths).toEqual(['my_path1', 'my_path2']);
            expect(commands.exportedEnvs).toEqual({
                'my_env_var1': 'my_env_var_value1',
                'my_env_var2': 'my_env_var_value2'
            });
            actionsTestHelper.afterTest();
        } finally {
            restoreProcessProps();
        }
    });

    it('should parse file commands', () => {
        const actionsTestHelper = new TestLifecycleHelper();
        const tmpPathCmdFileResult = tmp.fileSync({prefix: 'test_path_', keep: true});
        const tmpEnvCmdFileResult = tmp.fileSync({prefix: 'test_env_', keep: true});
        const restoreProcessProps = saveProcessProps();
        process.env.GITHUB_PATH = tmpPathCmdFileResult.name;
        process.env.GITHUB_ENV = tmpEnvCmdFileResult.name;
        try {
            actionsTestHelper.beforeTest();
            core.addPath('my_path1');
            core.addPath('my_path2');
            core.exportVariable('my_env_var1', 'my_env_%var_value1');
            core.exportVariable('my_env_var2', "my_env_\nvar_value2");
            const commands = actionsTestHelper.collectedCommands;
            expect(commands.addedPaths).toEqual(['my_path1', 'my_path2']);
            expect(commands.exportedEnvs).toEqual({
                'my_env_var1': 'my_env_%var_value1',
                'my_env_var2': "my_env_\nvar_value2"
            });
            actionsTestHelper.afterTest();
            expect(fs.existsSync(tmpPathCmdFileResult.name)).toBeTruthy();
            expect(fs.existsSync(tmpEnvCmdFileResult.name)).toBeTruthy();
            expect(fs.readFileSync(tmpPathCmdFileResult.name).toString().length).toEqual(0);
            expect(fs.readFileSync(tmpEnvCmdFileResult.name).toString().length).toEqual(0);
        } finally {
            tmpPathCmdFileResult.removeCallback();
            tmpEnvCmdFileResult.removeCallback();
            restoreProcessProps();
        }
    });
});