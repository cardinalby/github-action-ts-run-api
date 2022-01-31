# Run targets

In the terms of the library, a **run target** - is a class that can run particular kind of actions. Run target 
also can contain action config (a contents of `action.yml` file) and custom options.

The library supports 4 run targets, that can be created by calling factory methods in `RunTarget`.

TypeScript:
```ts
import {RunTarget} from 'github-action-ts-run-api';
```
JavaScript:
```js
const RunTarget = require('github-action-ts-run-api').RunTarget;
```

Every target has a `run(...)` method that:
1. accepts the same `RunOptions` object ([read more about options](./run-options.md)).
2. returns `RunResultInterface` (for sync targets) or `Promise<RunResultInterface>` for async targets. Run result
is slightly different for different targets. [Read more](./run-result.md) about base `RunResultInterface`.

## Overview

| RunTarget static methods    | Target name   | Description                                                          |
|-----------------------------|---------------|----------------------------------------------------------------------|
| `syncFn`                    | SyncFnTarget  | Isolate and run a single function                                    |
| `asyncFn`                   | AsyncFnTarget | Isolate, run and wait for promise from a single function             |
| `jsFile`                    | JsFileTarget  | Use JS file path to run in a child node process                      |
| `mainJs`, `postJs`, `preJs` | JsFileTarget  | Use JS file specified in `action.yml` to run in a child node process |
| `docker`                    | DockerTarget  | Build and run Docker container action                                |

## Single function target

Allows you to test your sync or async function in an isolated environment. 
It's useful, because you can mock function dependencies. Isolation consists of:
- preparing from options and restoring process `env`, `exitCode`, working dir after run.
- intercepting and parsing writes to `stdenv` and `stdout`.
- preparing temp dirs, files, env variables for GitHub runner environment emulation.

Usage examples can be found in [tests](../tests/integration/FnTarget.test.ts).

### Create sync function target
```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// No config action was specified. Default input values will not be applied
const target1 = RunTarget.syncFn(myFunc);
// Read action config from action.yml file. Default input values will be used from the inputs section.
const target2 = RunTarget.syncFn(myFunc, 'path/to/action.yml');
// Pass already parsed action config. Default input values will be used from the inputs section.
const target3 = RunTarget.syncFn(myFunc, parsedYmlObject);

const result = target1.run(RunOptions.create());
```
Returned result is a `FnRunResult` instance.

### Create async function target

Use async target if your function returns a Promise. Target run will wait until it fulfills to return.
```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// No config action was specified. Default input values will not be applied
const target1 = RunTarget.asyncFn(myFunc);
// Read action config from action.yml file. Default input values will be used from the inputs section.
const target2 = RunTarget.asyncFn(myFunc, 'path/to/action.yml');
// Pass already parsed action config. Default input values will be used from the inputs section.
const target3 = RunTarget.asyncFn(myFunc, parsedYmlObject);

const result = await target1.run(RunOptions.create());
```
Returned result is a `Promise<FnRunResult>` instance.

### Run result

[Read more](./run-result.md) about base result properties.

- `result.fnResult` contains a value returned by a tested function. 
In case of async function it is a value awaited from a Promise returned by a tested function.
Read about 
- `result.error` contains an error thrown by a function. For async function it's a Promise reject reason.
- `result.durationMs` contains run duration in milliseconds. For async function it is a time from function call to
the moment when Promise was fulfilled.
- `result.isTimedOut` is set to `true` if run duration took more time than specified `options.timeoutMs`.

### Remarks

🔻 `process.exit(...)` calls inside function are not mocked.

🔻 Specified `timeoutMs` in options doesn't limit an execution time, just sets `result.isTimedOut` property if execution
time was exceeded the timeout.

🔻 Keep in mind, `require("@actions/github").context` is cached inside actions library which can cause troubles if you run
multiple test cases. To get it around you can:
  - Use `new (require("@actions/github/lib/context").Context)()` instead
  - call `jest.resetModules()` after each test case run.

## JS file target

Runs a specified js file in a child node process.
Usage examples can be found in [tests](../tests/integration/JsFileTarget.test.ts).

### Create by passing JS file path

```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// No config action was specified. Default input values will not be applied
const target1 = RunTarget.jsFile('actionSrc/file.js');
// Read action config from action.yml file. Default input values will be used from the inputs section.
const target2 = RunTarget.jsFile('actionSrc/file.js', 'path/to/action.yml');
// Pass already parsed action config. Default input values will be used from the inputs section.
const target3 = RunTarget.jsFile('actionSrc/file.js', parsedYmlObject);

const result = target1.run(RunOptions.create());
```

### Create by specifying a `runs` key of a config

Reads a path to a js file from an action config. You can use `mainJs`, `preJs`, `postJs` to point to the 
corresponding `runs` key.

```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// Use js file from `runs.main` from action.yml
const target1 = RunTarget.mainJs('path/to/action.yml');
// Pass already parsed action config and a path prefix to find a js file, 
// specified in runs.main key.
const target2 = RunTarget.mainJs(parsedYmlObject, 'js/file/path/prefix');

const result = target1.run(RunOptions.create());
```

### Run result

[Read more](./run-result.md) about base result properties.

- `result.spawnResult` contains a result of `spawnSync` operation (spawning child node process)
- check `result.isTimedOut` to check if process was stopped due to timeout.

### Remarks

🔻 Normally, you pack a JS action in a single file before publishing using tools like 
  [ncc](https://github.com/vercel/ncc). It makes debugging difficult if you use `RunTarget.mainJs(...)` to create
  a target, because path in _action.yml_ points to a packed file, not a source one. 
  Use `RunTarget.jsFile(...)` with source path instead.

🔻 By default, child proc doesn't share parent process env variables (except `PATH`).
  * Call `options.setShouldAddProcessEnv(true)` to pass all env variables of a current process to the child one.
  * By default (`options.shouldAddProcessEnv == undefined`), env variables passed to the child process if debugger is
    attached to the parent process. It helps you to debug a spawned child process. 

🔻 Setting `options.timeoutMs` forces child process to exit after the specified period of time.

## Docker target

Use it to run/test your docker action. `action.yml` file should have `runs.using` key equal `docker`.
Builds and runs specified docker image. Works with native docker on Linux (including GitHub runners) and 
Docker Desktop on MacOS and Windows.

Usage examples can be found in [tests](../tests/integration/DockerTarget.test.ts).

### Path in container

Unlike other targets, docker target has fixed path of faked dirs and files inside container. 
But it's not recommended relying on them. You should use GitHub service env variables values instead.

| Environment variable | Value                       | Description                                                                                                                     |
|----------------------|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `RUNNER_TEMP`        | /home/runner/work/_temp     | Temp dir                                                                                                                        |
| `GITHUB_WORKSPACE`   | /github/workspace           | The default working directory on the runner for steps, and the default location of a repository when using the checkout action. |
| `GITHUB_EVENT_PATH`  | /github/workflow/event.json | The path of the file with the complete webhook event payload.                                                                   |
| `GITHUB_ENV`         | /github/file_commands/ENV   | file for exported vars commands                                                                                                 |
| `GITHUB_PATH`        | /github/file_commands/PATH  | file for added path commands                                                                                                    |

As in other targets, temporary created dirs used by default to fake these paths. As usual, you can specify
existing host dirs instead (`options.setTempDir()`, `options.setWorkspaceDir()`). In both cases dirs will be
mounted as volumes to a fixed paths in container and corresponding env variables will point to these paths.

### User for docker run

In the documentation, GitHub recommends running Docker action under root user in container. While testing your action 
on local Linux machine it can cause troubles if root user in container creates files in volumes mounted to the container.
Since you normally operate as a non-root user on your development machine, testing an action you will not be
able to access/delete created files.

For this reason Docker target by default runs a container under current user instead on Linux. 
On MacOS and Windows systems where Docker Desktop is normally used, it will be still run under root by default, because
Docker Desktop doesn't map file permissions directly to host files and they will be still available for a local user.

`RunTarget.docker()` accepts a second argument that allows to control this behaviour:
- `{ runUnderCurrentLinuxUser: true }` _(default)_ says to run a container with uid and gid of a current user.
- `{ runUnderCurrentLinuxUser: false }` says to run under root user (uid = 0, gid = 0).

### Create by specifying a path to `action.yml` file

```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// Use Dockerfile from `runs.image` key of action.yml
const target = RunTarget.docker('path/to/action.yml');

const result = target.run(RunOptions.create());
```

### Run result

[Read more](./run-result.md) about base result properties.

- `result.buildSpawnResult` contains a result of `spawnSync` operation of `docker build`. 
After a second and subsequent `run()` calls can be `undefined`, because image id has been cached.
- `result.spawnResult` contains a result of `spawnSync` operation of `docker run` or `undefined` if 
`docker build` failed first.
- `isSuccess` indicates whether both `docker build` and `docker run` commands were successful.
- `isSuccessBuild` indicates whether `docker build` command was successful.

### Remarks

🔻 Docker Desktop for Windows and MacOS behaves differently from native docker on Linux. Be aware!

🔻 Windows and MacOS GitHub hosted runners don't have installed docker.
 
🔻 Faked dirs and command files are mounted as volumes.