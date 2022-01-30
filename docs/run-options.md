# Run options

```ts
// TypeScript:
import {RunOptions} from 'github-action-ts-run-api';
```
Every target (function, JS file, Docker action) accepts a uniform `RunOptions` object. You can use the same
options to pass to the several targets.

## Construction

Use defaults, setup the object later:
```ts 
const options = RunOptions.create();
```
Pass [init values](../src/runOptions/InitRunOptionsInterface.ts) and still can be modified later:
```ts 
const options = RunOptions.create({
    inputs: {a: 'val'},
    // Result outputOptions will be: 
    // { 
    //     parseStdoutCommands: true,  // stays default 
    //     printStderr: false, 
    //     printStdout: undefined,     // stays default
    //     printRunnerDebug: false     // stays default
    // }
    outputOptions: { printStderr: false }
});
```
You can share partially prepared common options between tests and add/replace some options for each test by calling `clone()`
method on a shared object:

```ts
const commonOptions = RunOptions().create()
    .setInputs({a: 'a_val'});

const options = commonOptions
    // Deep clone
    .clone()
    // Result inputs: {a: 'a_val', b: 'b_val'}
    .setInputs({b: 'b_val'});
    // commonOptions still has only {a: 'a_val'}
```

## Methods

### 🔸 `setInputs(...)`

Specify a set of string inputs that will be mapped to the correspondent `INPUT_` env variables at the time
of action execution. It's an analog of `with` section in a workflow.

If your want to have default input values from `action.yml`, pass its path to the target factory.

```ts
const options = RunOptions.create() // {}
    .setInputs({a: 'A'}) // {a: 'A'}
    // modify
    .setInputs({b: 'B'}) // {a: 'A', b: 'B'}
    // modify
    .setInputs({a: undefined, b: 'X'}) // {b: 'X'}
    // replace
    .setInputs({c: 'C'}, false) // {c: 'C'}
```

### 🔸 `setEnv(...)`

Specify a [set](../src/types/EnvInterface.ts) of string 
[environment variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables) that will be 
set for action run. 
It's an analog of `env` section in a workflow. Doesn't override `setGithubContext()` and `setGithubServiceEnv()` 
in options object, but will be merged with other service env variables at action run.

```ts
const options = RunOptions.create() // {}
    .setEnv({A: 'a'}) // {A: 'a'}
    // modify
    .setEnv({B: 'b'}) // {A: 'a', B: 'b'}
    // modify
    .setEnv({A: undefined, B: 'x'}) // {B: 'x'}
    // replace
    .setEnv({C: 'c'}, false) // {C: 'c'}
```

### 🔸 `setShouldAddProcessEnv(...)`

`true`: add current process env variables to action env<br>
`false`: do not add<br>

`undefined` _(default)_: do not add, except the case of JS file target if debugger is attached (to enable you debugging a 
child proc).

⚠️ Special GitHub env variables (`GITHUB_ENV`, `GITHUB_PATH`) will not be passed to a target action. They will point
to fake file commands anyway. Even if you call `setFakeFsOptions({fakeCommandFiles: false})`, they will be empty in
action. It's done this way so as not to accidentally write to actual file commands of GitHub runner if your tests
run on CI.

Doesn't override env variables in options object, but will be merged with all service env variables at action run.

### 🔸 `setState(...)`

Specify a set of 
[saved state](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#sending-values-to-the-pre-and-post-actions) 
values that will be mapped to `STATE_` env variables at action run. 

Can be used to pass values from `result.commands.savedState` of _main_ script run to `post` scripts run.

```ts
const options = RunOptions.create() // {}
    .setState({A: 'a'}) // {A: 'a'}
    // modify
    .setState({B: 'b'}) // {A: 'a', B: 'b'}
    // modify
    .setState({A: undefined, B: 'x'}) // {B: 'x'}
    // replace
    .setState({C: 'c'}, false) // {C: 'c'}
```

### 🔸 `setGithubContext(...)`

Specify [properties](../src/types/GithubContextInterface.ts) of GitHub 
[context](https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts) 
that will be mapped to [corresponding](./src/types/GithubContextEnvsInterface.ts) env variables. 
In an action it's normally accessible by `require('@actions/github').context`.

Doesn't override `setEnv()` in options object, but will be merged with other service env variables at action run.

If you set a `payload` property, at action run it will be serialized to a temp file, its path will be set to 
`GITHUB_EVENT_PATH` env variable, so that `@actions/github` context can read it correctly.

```ts
const options = RunOptions.create() // {}
    // {repository: 'owner/repo'}
    .setGithubContext({repository: 'owner/repo'}) 
    // modify. {repository: 'owner/repo', ref: 'tag/x'}
    .setGithubContext({ref: 'tag/x'})
    // modify. {ref: 'refs/heads/b'}
    .setGithubContext({repository: undefined, ref: 'refs/heads/b'})
    // replace. {actor: 'me'}
    .setGithubContext({actor: 'me'}, false)
```

### 🔸`setGithubServiceEnv(...)`

A separate method (for convenience) to set GitHub [service env variables](../src/types/GithubServiceEnvInterface.ts).
Doesn't override `setEnv()` in options object, but will be merged with other service env variables at action run.

```ts
const options = RunOptions.create() // {}
    // {CI: 'true'}
    .setGithubServiceEnv({CI: 'true'}) 
    // modify. {CI: 'true', GITHUB_ACTIONS: 'true'}
    .setGithubServiceEnv({GITHUB_ACTIONS: 'true'})
    // modify. {GITHUB_ACTIONS: 'false'}
    .setGithubServiceEnv({CI: undefined, GITHUB_ACTIONS: 'false'})
    // replace. {GITHUB_REF_NAME: 'myTag'}
    .setGithubServiceEnv({GITHUB_REF_NAME: 'myTag'}, false)
```

### 🔸 `setShouldFakeMinimalGithubRunnerEnv(...)`

`false`: do not set any default values<br>
`true` _(default)_: emulate GitHub runner environment as possible by faking GitHub service and context envs.<br>

The following env variables will be set:

| Env variable       | Value                                           |
|--------------------|-------------------------------------------------|
| GITHUB_WORKFLOW    | test_workflow                                   |
| GITHUB_RUN_ID      | _random number_                                 |
| GITHUB_RUN_NUMBER  | 1                                               |
| GITHUB_JOB         | test_job                                        |
| GITHUB_ACTION      | _name from `action.yml` file, if set in target_ |
| GITHUB_ACTOR       | tester                                          |
| GITHUB_EVENT_NAME  | workflow_dispatch                               |
| GITHUB_SERVER_URL  | https://github.com                              |
| GITHUB_API_URL     | https://api.github.com                          |
| GITHUB_GRAPHQL_URL | https://api.github.com/graphql                  |
| CI                 | true                                            |
| GITHUB_ACTIONS     | true                                            |
| RUNNER_NAME        | test-runner                                     |
| RUNNER_OS          | _os, taken from the host_                       |
| RUNNER_ARCH        | _arch, taken from the host_                     |

 If set to `true`, it doesn't override env variables in options object, but will be merged at action run.
 Explicitly set variables will have higher priority during the merge.
 
### 🔸 `setOutputOptions(...)`

Set or modify action output handling options. Receives an object with optional properties if you
want to update only some properties.

| Property              | Type                     | Description                                                                                                                                                                                   | Default     |
|-----------------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `parseStdoutCommands` | boolean                  | If `false` commands will not be parsed from stdout                                                                                                                                            | `true`      |
| `printStdout`         | boolean &#124; undefined | Print action stdout.<br> if `undefined`, stdout will be printed only if `process.env.GITHUB_ACTIONS != 'true'` (so as not to accidentally interfere with github commands if run in GitHub CI) | `undefined` |
| `printStderr`         | boolean                  | Print action stderr to process stderr                                                                                                                                                         | `true`      |
| `printRunnerDebug`    | boolean                  | Print additional debug information                                                                                                                                                            | `false`     |

⚠️ If you use `printStdout == true` on GitHub Actions runner, it will lead to passing all commands of a tested
action directly to the GitHub runner, which is probably an undesired behavior.

```ts
// has defaults as in table above
const options = RunOptions.create() 
    // modify only parseStdoutCommands
    .setOutputOptions({parseStdoutCommands: false})
    // replace all output options
    .setOutputOptions({
        parseStdoutCommands: 'true',
        printStdout: 'true',
        printStderr: 'true',
        printRunnerDebug: 'true'
    }, false);
```

### 🔸 `setWorkingDir(...)`

Change a working dir path for an action. If you run Docker action, it should point to the path
inside container.

Default:
* For JavaScript actions: working dir of a current process 
* For Docker actions: `/github/workspace`

### 🔸 `setWorkspaceDir(...)`

Set path of an existing dir to `GITHUB_WORKSPACE` env variable. If you run
a docker action, it will be mounted as volume to `/github/workspace` and `GITHUB_WORKSPACE` will
point to it.

`undefined` _(default)_: create a temporary dir that will be deleted after run. To prevent
it from deleting, use `setFakeFsOptions({rmFakedWorkspaceDirAfterRun: false})`.

### 🔸 `setTempDir(...)`

Set path of an existing dir to `RUNNER_TEMP` env variable. If you run
a docker action, it will be mounted as volume to `/home/runner/work/_temp` and `RUNNER_TEMP` will
point to it.

`undefined` _(default)_: create a temporary dir that will be deleted after run. To prevent
it from deleting, use `setFakeFsOptions({rmFakedTempDirAfterRun: false})`.

### 🔸 `setFakeFsOptions(...)`

Set or update options related to faking dirs and files for an action. Receives an object with optional properties if you
want to update only some properties.

| Property                      | Type                    | Description                                                                                            | Default                                    |
|-------------------------------|-------------------------|--------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `tmpRootDir`                  | string &#124; undefined | Root temp dir to create faked dirs and files in.                                                       | `undefined` (system temp dir will be used) |
| `fakeCommandFiles`            | boolean                 | Create faked files and set their paths to `GITHUB_ENV` and `GITHUB_PATH` env variables.                | `true`                                     |
| `rmFakedTempDirAfterRun`      | boolean                 | Remove a `RUNNER_TEMP` dir at the end of a run if it wasn't set explicitly by `setTempDir()`           | `true`                                     |
| `rmFakedWorkspaceDirAfterRun` | boolean                 | Remove a `GITHUB_WORKSPACE` dir at the end of a run if it wasn't set explicitly by `setWorkspaceDir()` | `true`                                     |

### 🔸 `setTimeoutMs(...)`

Set timeout in milliseconds for an action run.
It works differently depending on a target:
* Docker and JS file targets (`docker`, `jsFile`, `mainJsScript`, `preJsScript`, `postJsScript`): limits the maximum execution time interrupting a spawned process.
* Function targets (`syncFn`, `asyncFn`): doesn't limit an execution time, just sets `isTimedOut` property in a run result.

If action exceeds the specified timeout, `isTimedOut` property of a run result will be set to `true`.

Default: `undefined` - no timeout.