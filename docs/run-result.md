# Run result

`run()` method of every run target returns a run result [object](../src/runResult/RunResultInterface.ts) 
(`asyncFn` target returns a Promise of run result).

```ts
const result1 = syncTarget.run(RunOptions.create());
const result2 = await asyncTarget.run(RunOptions.create());
```

Read 
[GitHub documentation](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter) 
to learn more about possible action commands (which are parsed by the library and are available in 
result object).

### 🔹 `commands.outputs`

Object with action outputs (parsed both from stdout and from $GITHUB_OUTPUT file). 
<details>
<summary>Example</summary>

Output set in JS action:
```js
const core = require('@actions/core');
core.setOutput('out1', 'val1');
```
Output set in bash script (Docker action):
```bash
echo "out1=val1" >> "$GITHUB_OUTPUT"
```
Read outputs:
```ts
result.commands.outputs // {out1: 'val1'}
```
</details>

### 🔹 `commands.errors`

Array of "error" commands parsed from stdout.
<details>
<summary>Example</summary>

Error added in JS action:
```js
const core = require('@actions/core');
core.error('msg');
```
Error added in bash script (Docker action):
```bash
echo "::error::msg"
```
Read errors:
```ts
result.commands.errors // ["msg"]
```
</details>

### 🔹 `commands.warnings`

Array of "warning" commands parsed from stdout.
<details>
<summary>Example</summary>

Warning added in JS action:
```js
const core = require('@actions/core');
core.warning('msg');
```
Warning added in bash script (Docker action):
```bash
echo "::warning::msg"
```
Read warnings:
```ts
result.commands.warnings // ["msg"]
```
</details>

### 🔹 `commands.notices`

Array of "notice" commands parsed from stdout.
<details>
<summary>Example</summary>

Notice added in JS action:
```js
const core = require('@actions/core');
core.notice('msg');
```
Notice added in bash script (Docker action):
```bash
echo "::notice::msg"
```
Read notices:
```ts
result.commands.notices // ["msg"]
```
</details>

### 🔹 `commands.debugs`

Array of "debug" commands parsed from stdout.
<details>
<summary>Example</summary>

Debug added in JS action:
```js
const core = require('@actions/core');
core.debug('msg');
```
Debug added in bash script (Docker action):
```bash
echo "::debug::msg"
```
Read debug commands:
```ts
result.commands.debugs // ["msg"]
```
</details>

### 🔹 `commands.secrets`

Array of "add-mask" commands parsed from stdout.
<details>
<summary>Example</summary>

Secret added in JS action:
```js
const core = require('@actions/core');
core.setSecret('password');
```
Secret added in bash script (Docker action):
```bash
echo "::add-mask::password"
```
Read secrets:
```ts
result.commands.secrets // ["password"]
```
</details>

### 🔹 `commands.savedState`

Object with saved state values (parsed both from stdout and from $GITHUB_STATE file)

<details>
<summary>Example</summary>

State saved in JS action:
```js
const core = require('@actions/core');
core.saveState('stateName', 'value');
```
State saved in bash script (Docker action):
```bash
echo "stateName=value" >> $GITHUB_STATE
```
Read saved state names and values:
```ts
result.commands.savedState // {stateName: 'value'}
```
</details>

### 🔹 `commands.echo`

Echo command parsed from stdout (`'on'|'off'|undefined`).

<details>
<summary>Example</summary>

Echo set in JS action:
```js
const core = require('@actions/core');
core.setCommandEcho(true);
```
Echo set in bash script (Docker action):
```bash
echo "::echo::on"
```
Read echo command value:
```ts
result.commands.echo // 'on'
```
</details>

### 🔹 `commands.addedPaths`

Array of "add path" commands (parsed both from stdout and from $GITHUB_PATH file).

<details>
<summary>Example</summary>

Add path in JS action:
```js
const core = require('@actions/core');
core.addPath('some/path');
```
Add path in bash script (Docker action):
```bash
echo "some/path" >> "$GITHUB_PATH"
```
Read added path:
```ts
result.commands.addedPaths // ['some/path']
```
</details>

### 🔹 `commands.exportedVars`

Object with variables exported to workflow env (parsed both from stdout and from $GITHUB_ENV file).

<details>
<summary>Example</summary>

Export variable in JS action:
```js
const core = require('@actions/core');
core.exportVariable('varName', 'varValue');
```
Export variable in bash script (Docker action):
```bash
# For multi-line values you need to use delimiters
echo "varName=varValue" >> "$GITHUB_PATH"
```
Read exported variables:
```ts
result.commands.exportedVars // {varName: 'varValue'}
```
</details>

### 🔹 `exitCode`

Exit code (`number|undefined`) 
* of a child process (for JS file and Docker targets)
* code set to `process.exitCode` (for a single function target).

### 🔹 `stdout`

Data (`string|undefined`) intercepted from stdout of a tested action.

### 🔹 `stderr`

Data (`string|undefined`) intercepted from stderr of a tested action.

### 🔹 `error`

`Error|undefined` happened in a test. 

* Error from `spawnSync` result (for JS file and Docker targets)
* Error thrown in `syncFn` and `asyncFn` targets or returned Promise rejected reason for `asyncFn` target.

### 🔹 `durationMs`

Duration of target execution in milliseconds (`number`). 
For `asyncFn` target counts as time passed from the moment 
of calling a function to the moment when Promise fulfills.

### 🔹 `isTimedOut`

`true` if a target execution took more time than timeout specified in `timeoutMs` property of options;
`false` otherwise.

### 🔹 `isSuccess`

`true` if exitCode is 0 (or not set in function) and error is `undefined`; `false` otherwise.

### 🔹 `tempDirPath`

Path of a temp directory (accessible under `RUNNER_TEMP` inside tested action) that is still available 
after the action run. By default, it's `undefined` because faked dirs are deleted after run.
For Docker target it contains a path of the host directory.

Can have value in case of:
1. You asked not to delete faked temp dir after run: <br> 
   `options.setFakeFsOptions({ rmFakedTempDirAfterRun: false })`.<br>
   You are supposed to call `result.cleanUpFakedDirs()` at the end of a test by yourself.
2. You set existing directory as action temp dir: `options.setTempDir('existing/path')`.

### 🔹 `workspaceDirPath`

Path of a workspace directory (accessible under `GITHUB_WORKSPACE` inside tested action) that is still available
after the action run. By default, it's `undefined` because faked dirs are deleted after run.
For Docker target it contains a path of the host directory.

Can have value in case of:
1. You asked not to delete faked workspace dir after run:<br>
   `options.setFakeFsOptions({ rmFakedWorkspaceDirAfterRun: false })`.<br>
   You are supposed to call `result.cleanUpFakedDirs()` at the end of a test by yourself.
2. You set existing directory as action temp dir: `options.setWorkspaceDir('existing/path')`.

### 🔹 `warnings`

The property is an array of [`Warning`](../src/runResult/warnings/RunnerWarning.ts)) objects 
and contains warnings similar to ones produced by GitHub Runner. 

By default, warning messages are printed to stderr at the end of the run.
If you want to check them by yourself, you can disable this behavior by
`options.setOutputOptions({printWarnings: false})`. 

Read detailed description [here](./run-result-warnings.md).  

### 🔹 `cleanUpFakedDirs()` method

Delete faked directories that still exist after run. It will not delete existing dirs set explicitly by 
`options.setWorkspaceDir(...)` and `options.setTempDir(...)` functions.

You have to call it only if you used `rmFakedTempDirAfterRun: false` or `rmFakedWorkspaceDirAfterRun: false` options
for fake FS options. 

Alternatively, you can set up calling global `deleteAllFakedDirs()` method after each test case in your
test framework.

Example with Jest:

```ts
import {deleteAllFakedDirs} from 'github-action-ts-run-api';

afterEach(deleteAllFakedDirs);
```

### 🔸 `fnResult`

_**ONLY** for `asyncFn` and `syncFn` targets_

Contains a value returned by a tested function.
In case of `asyncFn` target, it's a value that promise was fulfilled with.

### 🔸 `spawnResult`

_**ONLY** for JS file and Docker targets_

Contains a result of a spawning of child process:
* node process for JS file targets
* `docker run` for Docker target

### 🔸 `buildSpawnResult`

_**ONLY** for Docker target_

Contains a result of spawning of `docker build`. 
After a second and subsequent `run()` calls can be `undefined`, because image id has been cached.

### 🔸 `isSuccessBuild`

_**ONLY** for Docker target_

Indicates whether `docker build` command was successful.