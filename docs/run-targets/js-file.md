# JavaScript file target

Runs a specified _js_ file in a child node process.

## Create by passing JS file path

```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// No action config was specified. 
// * Default input values will not be applied
const target1 = RunTarget.jsFile('actionSrc/file.js');

// Read action config from action.yml file. 
// * Default input values will be used from the inputs section.
const target2 = RunTarget.jsFile('actionSrc/file.js', 'path/to/action.yml');

// Pass already parsed action config. 
// * Default input values will be used from the inputs section.
const target3 = RunTarget.jsFile('actionSrc/file.js', parsedYmlObject);

const result = target1.run(RunOptions.create());
```

## Create by specifying a `runs` key of a config

Reads a path to a js file from an action config. 
You can use `mainJs`, `preJs`, `postJs` to point to the corresponding `runs` key.

```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// Use js file from `runs.main` from action.yml
const target1 = RunTarget.mainJs('path/to/action.yml');

// Pass already parsed action config and a path prefix to find a js file, 
// specified in runs.main key.
const target2 = RunTarget.mainJs(parsedYmlObject, 'js/file/path/prefix');

const result = target1.run(RunOptions.create());
```

## Run result

#### [🔹 Common result properties](../run-result.md)
#### [📁 TypeScript interface](../../src/actionRunner/jsFile/runResult/JsFileRunResultInterface.ts)

### Fields

#### 🔸 `spawnResult` 
Contains a result of spawning child node process.

#### 🔹 `result.isTimedOut`
If `true`, indicates that process was stopped due to timeout.

## Examples

Usage examples can be found in [JsFileTarget.test.ts](../../tests/integration/JsFileTarget.test.ts).

## Remarks

🔻 Normally, you pack a JS action to a single file using tools like
[ncc](https://github.com/vercel/ncc) before publishing. 

It makes debugging difficult if you use `RunTarget.mainJs(...)` to create
a target, because path in _action.yml_ points to a packed file, not a source one.

Use `RunTarget.jsFile(...)` with source path instead.

🔻 By default, child proc doesn't share parent process env variables (except `PATH`).
`shouldAddProcessEnv` [option](../run-options.md#-setshouldaddprocessenv) can control this behavior.

- By default (`undefined`), env variables passed to the child process if debugger is
attached to the parent process. It helps you to debug a spawned child process.
- `true` value will force a target to pass all env variables of a current process to the child one.

🔻 Setting `options.timeoutMs` forces child process to exit after the specified period of time.

## Testing techniques

<details>
<summary>Stubbing GitHub API by local NodeJS HTTP server</summary>

_main.js_:

```js
const core = require('@actions/core');
const octokit = require('@actions/github').getOctokit(
    process.env.GITHUB_TOKEN,
    { baseUrl: process.env.GITHUB_API_URL }
);

octokit.rest.repos.get({ repo: 'repo', owner: 'owner' })
    .then(resp =>  
        core.setOutput('out1', resp.data) 
    );
```

_action.test.ts_:

```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

const port = 8234;
const server = http.createServer((req, res) => {
    if (req.url === '/repos/owner/repo') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end('{"name":"x"}');
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(port);

try {
    const target = RunTarget.mainJs('path/to/action.yml');
    const res = await target.run(RunOptions.create()
        .setGithubContext({apiUrl: `http://localhost:${port}`})
        .setEnv({GITHUB_TOKEN: 't'})
    );
    assert(res.commands.outputs.out1 === '{"name":"x"}');
} finally {
    server.close();
}
```
</details>

### [👈 Back to overview of targets](../run-targets.md)