[![test](https://github.com/cardinalby/github-action-ts-run-api/actions/workflows/test.yml/badge.svg)](https://github.com/cardinalby/github-action-ts-run-api/actions/workflows/test.yml)
[![publish](https://github.com/cardinalby/github-action-ts-run-api/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/cardinalby/github-action-ts-run-api/actions/workflows/npm-publish.yml)

# TypeScript API for GitHub Action execution and integration/functional testing

## Purpose

🔶 Execute your GitHub action **locally** (or at any other environment).

🔶 Write integration and functional tests for an action, run them locally and on CI.

🔶 Have a short feedback loop without pushing and checking an action behaviour at real GitHub runners every time you change it.

## Features

✅ Supports executing JavaScript and Docker actions.

✅ Tested under Windows, Linux and macOS (Intel + Apple Silicon), NodeJS >= 12 locally and on GitHub hosted runners.

✅ Works well with Docker Desktop under Windows and macOS.

✅ Can be used together with any JavaScript test frameworks or alone.<br>

✅ Can execute an explicitly specified JS file or _main_, _pre_, _post_ script from `action.yml`.

✅ Can execute a separate sync or async JS function, isolating its environment (process env, exitCode and working dir), intercepting _stdout_ and _stderr_ output for effective dependencies mocking.

✅ Has a clear JavaScript API with TypeScript declarations and reasonable defaults

✅ Produces warnings about deprecated Actions commands

### Setting up an action run option includes:

* Inputs. Can read default input values from `action.yml`
* Saved state
* Custom environment variables
* GitHub context
* GitHub service environment variables
* Faking GitHub service files (file commands, event payload file)
* Faking GitHub dirs (workflow, workspace, temp)

### Reading results of an action run includes:

* Reading exit code, stdout and stderr
* Reading outputs, saved state, warnings, errors, notices and secrets from intercepted stdout
* Reading exported vars, added paths from faked file commands

## Installation

Install for use in tests
```
npm i github-action-ts-run-api --save-dev
```

## Documentation

- [Run targets overview](./docs/run-targets.md)
  * [Single function target](./docs/run-targets/function.md)
  * [JavaScript file target](./docs/run-targets/js-file.md)
  * [Docker target](./docs/run-targets/docker.md)
- [Run options](./docs/run-options.md)
- [Run result](./docs/run-result.md)
- [Run result warnings](./docs/run-result-warnings.md) (**new**! starting from **2.3.0**)


### Other information:

* [Testing of GitHub Actions](https://cardinalby.github.io/blog/post/github-actions/testing/1-testing-of-github-actions-intro/) article.

## Quick examples

### Test JS action in a child node process
<details>
<summary>action.yml</summary>

```yaml
name: 'test'
# ...
runs:
  using: 'node16'
  main: 'main.js'
```

</details>

<details>
<summary>main.js:</summary>

```js
const core = require("@actions/core");
const context = require('@actions/github').context;
const fs = require('fs');

core.addPath('newPath');
fs.writeFileSync(
    path.join(process.env.RUNNER_TEMP, 'f.txt'),
    context.payload.pull_request.number.toString()
);
```

</details>

action.test.ts:
```ts
import {RunOptions, RunTarget} from 'github-action-ts-run-api';

// You can also test "pre" and "post" scripts
const target = RunTarget.mainJsScript('action.yml');
const options = RunOptions.create()
    // Internally, runner will fake a json file to be picked by @actions/github
    .setGithubContext({payload: {pull_request: {number: 123}}})
    // By default, RUNNER_TEMP is faked for a run and then deleted. Keep it
    .setFakeFsOptions({rmFakedTempDirAfterRun: false});

const res = await target.run(options);

try {
    assert(res.commands.addedPaths === ['newPath']);
    // somewhere in system temp dir
    const pathOfCreatedFile = path.join(res.tempDirPath, 'f.txt');
    // check the contents of a file saved by tested action
    assert(fs.readFileSync(pathOfCreatedFile).toString() === '123');
} finally {
    // we should do it manually because we set rmFakedTempDirAfterRun: false
    // otherwise it is deleted at the end of target.run()
    res.cleanUpFakedDirs();
    
    // With Jest you can use this instead:
    // This code also gets executed on test timeout 
    // afterAll(() => { 
    //     deleteAllFakedDirs(); 
    // });
}
```

### Test JavaScript function in isolated Action environment
<details>
<summary>main.js</summary>

```js
const core = require("@actions/core");

export async function actionMainFn() {
    core.setOutput('out1', core.getInput('in1'));
    core.setOutput('out2', process.env.ENV2);
    core.exportVariable('v3', core.getState('my_state'));
    // writes to errors and sets process.exitCode to 1
    return new Promise(resolve => setTimeout(() => {
        core.setFailed('err1');
        resolve();
        }, 1000));    
}
```

</details>

main.test.ts:
```ts
import {RunOptions, RunTarget} from 'github-action-ts-run-api';
import {actionMainFn} from './main.js';

// Will wait until returned promise fulfills. 
// Use RunTarget.syncFn() for regular functions
const target = RunTarget.asyncFn(actionMainFn);
const options = RunOptions.create()
    .setInputs({in1: 'abc'})
    .setEnv({ENV2: 'def'})
    .setState({my_state: 'ghi'});

const result = await target.run(options);

assert(result.durationMs >= 1000);
assert(result.commands.outputs === {out1: 'abc', out2: 'def'});
assert(result.commands.exportedVars === {v3: 'ghi'});
assert(result.exitCode === 1);
assert(result.runnerWarnings.length === 0);
// changes were isolated inside a function run
assert(process.exitCode !== 1);
assert(result.commands.errors === ['err1']);
```

### Test Docker action

```ts
import {RunOptions, RunTarget} from 'github-action-ts-run-api';

const target = RunTarget.dockerAction('action.yml');
const options = RunOptions.create()
    .setInputs({input1: 'val1', input2: 'val2'})    
    .setEnv({ENV1: 'val3'})
    .setWorkingDir('/dir/inside/container')
    .setTimeoutMs(5000)
//  ...
const res = await target.run(options);

console.log(
    res.commands.outputs,
    res.commands.exportedVars,
    res.isSuccessBuild,
    res.isSuccess,
    res.isTimedOut
);
```

### Integration tests examples:

You can find **examples** for the complicated cases in the **library** integration **tests**:
* [Docker target test](./tests/integration/DockerTarget.test.ts)
* [JS file target test](./tests/integration/JsFileTarget.test.ts)
* [Function target test](./tests/integration/FnTarget.test.ts)

Also, check out **real actions** integration **tests**:

* [git-get-release-action](https://github.com/cardinalby/git-get-release-action/blob/master/tests/integration/action.test.ts)
* [schema-validator-action](https://github.com/cardinalby/schema-validator-action/blob/master/tests/integration/main.test.ts)
* [js-eval-action](https://github.com/cardinalby/js-eval-action/blob/master/tests/integration/cliAction.test.ts)
