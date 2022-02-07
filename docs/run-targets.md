# Run targets

In the terms of the library, a **run target** - is a class that can run particular kind of GitHub actions. 
Run target also can contain an action config (a contents of `action.yml` file) and custom options.

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
1. Accepts the uniform `RunOptions` object ([read more about options](./run-options.md)).
2. Returns 
   - `RunResultInterface` for sync targets (`syncFn`).
   - `Promise<RunResultInterface>` for async targets (all other targets).
3. Run result is slightly different for different targets ([read more about run result](./run-result.md)).

## Overview

| RunTarget static methods    | run() returns                                                                                  | Description                                                          |
|-----------------------------|------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `syncFn`                    | [`FnRunResult`](../src/actionRunner/fn/runResult/FnRunResultInterface.ts)                      | Isolate and run a single function                                    |
| `asyncFn`                   | [`Promise<FnRunResult>`](../src/actionRunner/fn/runResult/FnRunResultInterface.ts)             | Isolate, run and await promise from a single function                |
| `jsFile`                    | [`Promise<JsFileRunResult>`](../src/actionRunner/jsFile/runResult/JsFileRunResultInterface.ts) | Use JS file path to run in a child node process                      |
| `mainJs`, `postJs`, `preJs` | [`Promise<JsFileRunResult>`](../src/actionRunner/jsFile/runResult/JsFileRunResultInterface.ts) | Use JS file specified in `action.yml` to run in a child node process |
| `dockerAction`              | [`Promise<DockerRunResult>`](../src/actionRunner/docker/runResult/DockerRunResultInterface.ts) | Build and run Docker container action                                |
| `dockerFile`                | [`Promise<DockerRunResult>`](../src/actionRunner/docker/runResult/DockerRunResultInterface.ts) | Build and run specified Dockerfile directly                          |

## Detailed description

#### 👉 [Single function target](./run-targets/function.md) (`syncFn`, `asyncFn`)
#### 👉 [JavaScript file target](./run-targets/js-file.md) (`jsFile`, `mainJs`, `postJs`, `preJs`)
#### 👉 [Docker target](./run-targets/docker.md) (`dockerAction`, `dockerFile`)

