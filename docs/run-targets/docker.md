# Docker target

Use Docker target to run/test your docker action. `action.yml` file should have `runs.using` key equal `docker`.

Builds and runs specified docker image. Works with native docker on Linux (including GitHub runners) and
Docker Desktop on MacOS and Windows.

## Paths in container

Unlike other targets, docker target has fixed path of faked dirs and files inside a container.
But relying on them is not recommended. You should use GitHub 
[environment variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables) values instead.

| Environment variable | Value                         | Description                                                                                                                     |
|----------------------|-------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| _RUNNER_TEMP_        | `/home/runner/work/_temp`     | Temp dir                                                                                                                        |
| _GITHUB_WORKSPACE_   | `/github/workspace`           | The default working directory on the runner for steps, and the default location of a repository when using the checkout action. |
| _GITHUB_EVENT_PATH_  | `/github/workflow/event.json` | The path of the file with the complete webhook event payload.                                                                   |
| _GITHUB_ENV_         | `/github/file_commands/ENV`   | file for exported vars commands                                                                                                 |
| _GITHUB_PATH_        | `/github/file_commands/PATH`  | file for added path commands                                                                                                    |

As in other targets, temporary created dirs used by default to fake these paths. 

As usual, you can specify
existing host dirs instead (`options.setTempDir()`, `options.setWorkspaceDir()`). 

In both cases dirs will be
mounted as volumes to a fixed paths in container and corresponding env variables will point to these paths.

## Create by passing a path to `action.yml` file

```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// Read the details below
const dockerOptions = {};

// Use Dockerfile from `runs.image` key of action.yml
const target = RunTarget.dockerAction('path/to/action.yml', dockerOptions);

const result = target.run(RunOptions.create());
```

## Create by passing a path to `Dockerfile`

This approach can be used if you want to perform an integration test run not the whole action,
but only a part of it. In this case you can create a separate Dockerfile that will have only
needed functionality and run tests against it.
```ts
import {RunTarget, RunOptions} from 'github-action-ts-run-api';

// Read the details below
const dockerOptions = {};

// No action config was specified. 
// * Default input values will not be applied
// * Container args will not be passed to a container
const target1 = RunTarget.dockerFile('path/to/Dockerfile', undefined, dockerOptions);

// Read action config from action.yml file. 
// * Default input values will be used from the inputs section.
// * Container args defined in the action config will be passed to a container
const target2 = RunTarget.dockerFile('actionSrc/file.js', 'path/to/action.yml', dockerOptions);

// Pass already parsed action config. 
// * Default input values will be used from the inputs section.
// * Container args defined in the action config will be passed to a container
const target3 = RunTarget.dockerFile('actionSrc/file.js', parsedYmlObject, dockerOptions);

const result = target.run(RunOptions.create());
```

## Docker options

Passing the optional `dockerOptions` argument is demonstrated in the examples above.

It has [2 fields](../../src/actionRunner/docker/runTarget/DockerOptionsInterface.ts) that you can set:

### 🔸 `runUnderCurrentLinuxUser`

In the [documentation](https://docs.github.com/en/actions/creating-actions/dockerfile-support-for-github-actions), 
GitHub recommends running Docker action under _root_ user in a container.

While testing your action
on local Linux machine it can cause troubles if _root_ user in container creates files in volumes mounted to the container.
Since you normally operate as a non-root user on your development machine, testing an action you will not be
able to access/delete created files.

For this reason Docker target by default runs a container under _current user_ on Linux.
On macOS and Windows systems where Docker Desktop is normally used, it will be still run under _root_ by default, because
Docker Desktop doesn't map file permissions directly to host files, and they will be still available for a local user.

- `true` _(default)_: run a container with _uid_ and _gid_ of a current user (only for Linux).
- `false`: run under root user (uid = 0, gid = 0).

### 🔸 `network`

A name of the docker network to attach a container to.

- `undefined` _(default)_: attach to default bridge network
- _string name_: attach to a network by name

This option can be used to mock some external services by containers with stub HTTP servers.

## Run result

#### [🔹 Common result properties](../run-result.md)
#### [📁 TypeScript interface](../../src/actionRunner/docker/runResult/DockerRunResultInterface.ts)

### Fields

#### 🔸 `buildSpawnResult` 
Contains a result of a spawning of child `docker build` command.
 After a second and subsequent `run()` calls can be `undefined`, because image id has been cached.

#### 🔸 `spawnResult` 
Contains a result of a spawning of child `docker run` command or `undefined` if
the build command failed first.

#### 🔸 `isSuccessBuild` 
Indicates whether `docker build` command was successful.

#### 🔹 `isSuccess`
Indicates whether both `docker build` and `docker run` commands were successful.

## Examples

Usage examples can be found in [DockerTarget.test.ts](../../tests/integration/DockerTarget.test.ts).

## Remarks

🔻 Docker Desktop for Windows and MacOS behaves differently from native docker on Linux. Be aware!

🔻 Windows and MacOS GitHub hosted runners don't have installed docker.

🔻 Faked dirs and command files are mounted as volumes.

## Utilities

#### 📌 `getDockerHostName()`

Returns the host that can be used inside container to access the Docker host machine.

See _"Stubbing GitHub API by local NodeJS HTTP server"_ example below.

#### 📌 `withDockerCompose()`

The wrapper that starts/stops a docker compose file around a callback.
Performs _docker compose up_, then runs `callback` function and after its promise fulfilled,
runs _docker compose down_.

See _"Stubbing GitHub API by HTTP server container"_ example below.

## Testing techniques

<details>
<summary>Stubbing GitHub API by local NodeJS HTTP server</summary>

_entrypoint.sh_:

```bash
echo "::set-output name=out1::$(curl "$GITHUB_API_URL"/repos/owner/repo/releases)"
```

_action.test.ts_:

```ts
import {RunTarget, RunOptions, getDockerHostName} from 'github-action-ts-run-api';

const port = 8234;
const server = http.createServer((req, res) => {
    if (req.url === '/repos/owner/repo/releases') {
        res.writeHead(200);
        res.end('fake_response');
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(port);

try {
    const target = RunTarget.dockerAction('path/to/action.yml');
    const res = await target.run(RunOptions.create()
        // Using '172.17.0.1' or 'host.docker.internal' 
        // the action container can access the host  
        .setGithubContext({apiUrl: `http://${getDockerHostName()}:${port}`})
    );
    assert(res.commands.outputs.out1 === 'fake_response');
} finally {
    server.close();
}
```
</details>

<details>
<summary>Stubbing GitHub API by HTTP server container</summary>

_entrypoint.sh_:

```bash
echo "::set-output name=out1::$(curl "$GITHUB_API_URL"/repos/owner/repo/releases)"
```

_docker-compose.yml_:

```yaml
version: "3.5"
services:
  fake-server:
    build:
      # Image with stub GitHub API HTTP server
      context: httpServerDir
    ports:
      - "80:80"
networks:
  default:
    # Assign a name to the network to connect 
    # the tested action container to it
    name: testNet
```

_action.test.ts_:

```ts
import {RunTarget, RunOptions, withDockerCompose} from 'github-action-ts-run-api';

await withDockerCompose(
    'path/to/docker-compose.yml',
    async () => {
        const target = RunTarget.dockerAction(
            'path/to/action.yml', 
            // network name defined in docker-compose.yml    
            {network: 'testNet'}
        );
        const res = await target.run(RunOptions.create()
            // service name defined in docker-compose.yml
            .setGithubContext({apiUrl: `http://fake-server:80`})
        );
        assert(res.commands.outputs.out1 === 'fake_response');
});
```
</details>





### [👈 Back to overview of targets](../run-targets.md)