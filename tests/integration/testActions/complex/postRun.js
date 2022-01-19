const core = require('@actions/core');

async function waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function syncPostRun () {
    core.warning(process.cwd());
    core.debug('post_script_debug');
    core.notice(core.getState('my_state'));
}

async function asyncPostRun () {
    core.info('waiting');
    await waitFor(10);
    syncPostRun();
}

module.exports.syncPostRun = syncPostRun;
module.exports.asyncPostRun = asyncPostRun;