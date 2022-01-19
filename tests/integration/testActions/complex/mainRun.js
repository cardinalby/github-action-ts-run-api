const core = require('@actions/core');
const os = require("os");

async function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    const delayMs = parseInt(core.getInput('delayMs'));
    if (!Number.isNaN(delayMs)) {
        await waitFor(delayMs);
    }

    const setState = core.getInput('setState');
    if (setState) {
        core.saveState('my_state', setState);
    }

    if (core.getBooleanInput('sendStdoutCommands', {required: true})) {
        core.error('err%msg1');
        core.error('err%msg2');
        core.warning('warning\rmsg');
        core.notice('notice:msg1');
        core.notice('notice:msg2');
        core.setOutput('out1', 'out1_val');
        core.setOutput('out2', 'out2_val');
        core.debug(process.env.MY_ENV_VAR);
        core.info('info_msg');
        core.setSecret('secret1');
        core.setSecret('secret2');
        core.setCommandEcho(true);
        process.stdout.write('::set-output na');
        process.stdout.write('me=out3::out3_val' + os.EOL + '::debug::de');
        process.stdout.write('bug_msg2' + os.EOL);
    }

    if (core.getBooleanInput('sendFileCommands', {required: true})) {
        core.addPath('my_path1');
        core.addPath('my_path2');
        core.exportVariable('my_env_var1', 'my_env_var_value1');
        core.exportVariable('my_env_var2', 'my_env_var_value2');
    }

    if (core.getBooleanInput('failAtTheEnd', {required: true})) {
        core.setFailed('failed_msg');
    }
}

module.exports.run = run;