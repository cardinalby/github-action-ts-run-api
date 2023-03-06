const core = require('@actions/core');

async function run() {
    const setState = core.getInput('setState');
    if (setState) {
        core.saveState('my_state', setState);
    }
}

module.exports.run = run;