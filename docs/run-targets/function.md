# Single function target

Allows you to test your sync or async function in an isolated environment.
It's useful, because you can mock function dependencies. Isolation consists of:
- preparing from options and restoring process `env`, `exitCode`, working dir after run.
- intercepting and parsing writes to `stdenv` and `stdout`.
- preparing temp dirs, files, env variables for GitHub runner environment emulation.

## Create sync function target
```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// No action config was specified. 
// * Default input values will not be applied
const target1 = RunTarget.syncFn(myFunc);

// Read action config from action.yml file. 
// * Default input values will be used from the inputs section.
const target2 = RunTarget.syncFn(myFunc, 'path/to/action.yml');

// Pass already parsed action config. 
// * Default input values will be used from the inputs section.
const target3 = RunTarget.syncFn(myFunc, parsedYmlObject);

// Returned result is a `FnRunResult` instance.
const result = target1.run(RunOptions.create());
```

## Create async function target

Use async target if your function returns a Promise. Target run will wait until it fulfills to return.
```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// No action config was specified. 
// * Default input values will not be applied
const target1 = RunTarget.asyncFn(myFunc);

// Read action config from action.yml file. 
// * Default input values will be used from the inputs section.
const target2 = RunTarget.asyncFn(myFunc, 'path/to/action.yml');

// Pass already parsed action config. 
// * Default input values will be used from the inputs section.
const target3 = RunTarget.asyncFn(myFunc, parsedYmlObject);

// Returned result is a `Promise<FnRunResult>` instance.
const result = await target1.run(RunOptions.create());
```

## Run result

#### [🔹 Common result properties](../run-result.md)
#### [📁 TypeScript interface](../../src/actionRunner/fn/runResult/FnRunResultInterface.ts)

### Fields

#### 🔸 `fnResult` 
Contains a value returned by a tested function. In case of async function it is a value awaited from a 
Promise returned by a tested function.

#### 🔹 `error` 
Contains an error thrown by a function. For async function it's a Promise reject reason.

#### 🔹 `durationMs` 
Contains run duration in milliseconds. For async function it is a time from function call to
the moment when Promise was fulfilled.

#### 🔹 `isTimedOut` 
Is set to `true` if run duration took more time than specified `options.timeoutMs`.

## Examples

Usage examples can be found in [FnTarget.test.ts](../../tests/integration/FnTarget.test.ts).

## Remarks

🔻 `process.exit(...)` calls inside a function are not mocked and will lead to process termination without 
cleaning up test environment. Try to avoid them.

🔻 Specified `timeoutMs` in options doesn't limit an execution time, just sets `result.isTimedOut` 
property if execution time was exceeded the timeout.

🔻 Keep in mind, `require("@actions/github").context` is cached inside actions library which can cause troubles if you run
multiple test cases. To get it around you can:
- Use `new (require("@actions/github/lib/context").Context)()` instead.
- Call `jest.resetModules()` after each test case run.

### [👈 Back to overview of targets](../run-targets.md)