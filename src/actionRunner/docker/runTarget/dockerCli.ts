import {ChildProcessWithoutNullStreams, spawn, spawnSync} from "child_process";
import {EnvInterface} from "../../../types/EnvInterface";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import os from "os";
import {spawnAsync, SpawnAsyncResult} from "../../../utils/spawnAsync";
import path from "path";
import {StdoutTransform} from "../../../runOptions/StdoutTransform";

function debugSpawnArgs(args: readonly string[]) {
    const charsToEscape = /(["'$`\\])/g;
    process.stdout.write(
        'docker ' +
        args.map(arg => arg.search(charsToEscape) != -1
            ? '"'+arg.replace(charsToEscape,'\\$1')+'"'
            : arg
        ).join(' ') +
        os.EOL
    );
}

export namespace DockerCli {

    export interface RunOptions {
        imageId: string;
        name?: string;
        env?: EnvInterface;
        volumes?: StringKeyValueObj; // source: target
        workdir?: string|undefined;
        user?: string;
        network?: string;
        args?: string[];
        timeoutMs?: number;
        printDebug?: boolean;
        printStdout?: boolean;
        stdoutTransform: StdoutTransform,
        printStderr?: boolean;
    }

    export function isInstalled(): boolean {
        const spawnRes = spawnSync('docker', ['-v'], {encoding: 'utf8'});
        return spawnRes.status === 0 && spawnRes.error === undefined;
    }

    /**
     * @return {string} image id
     */
    export async function build(
        dockerFilePath: string,
        printDebug: boolean
    ): Promise<SpawnAsyncResult> {
        const args = ['build', '-q', '-f', dockerFilePath, path.dirname(dockerFilePath)];
        printDebug && debugSpawnArgs(args);
        const result = await spawnAsync('docker', args);
        if (printDebug && result.status == 0 && result.stdout) {
            process.stdout.write(result.stdout + os.EOL);
        }
        return result;
    }

    function getRunSpawnArgs(options: RunOptions): ReadonlyArray<string> {
        const args = ['run', '--rm'];
        if (options.user !== undefined) {
            args.push('--user', options.user)
        }
        if (options.name) {
            args.push('--name', options.name);
        }
        if (options.workdir) {
            args.push('--workdir', options.workdir);
        }
        Object.entries(options.volumes || {}).forEach(entry => {
            if (entry[1] !== undefined) {
                args.push('-v', `${entry[0]}:${entry[1]}`);
            }
        });
        Object.entries(options.env || {}).forEach(entry => {
            if (entry[1] !== undefined) {
                args.push('-e', `${entry[0]}=${entry[1]}`);
            }
        });
        if (options.network !== undefined) {
            args.push('--network', options.network);
        }
        args.push(options.imageId);
        options.args && args.push(...options.args);
        return args;
    }

    export async function runAndWait(options: RunOptions): Promise<SpawnAsyncResult> {
        const args = getRunSpawnArgs(options);
        options.printDebug && debugSpawnArgs(args);
        return spawnAsync(
            'docker',
            args,
            {
                timeout: options.timeoutMs,
                printStdout: options.printStdout || false,
                stdoutTransform: options.stdoutTransform || StdoutTransform.NONE,
                printStderr: options.printStderr || false
            }
        );
    }

    export async function run(options: RunOptions): Promise<ChildProcessWithoutNullStreams> {
        const args = getRunSpawnArgs(options);
        options.printDebug && debugSpawnArgs(args);
        const spawnResult = spawn(
            'docker',
            args,
            {
                timeout: options.timeoutMs
            }
        );
        return new Promise((resolve, reject) => {
            spawnResult.on('spawn', () => resolve(spawnResult));
            spawnResult.on('error', err => reject(err));
        })
    }

    export async function composeUp(
        dockerComposeYmlPath: string,
        options: string[] = [],
        printDebug: boolean
    ): Promise<SpawnAsyncResult> {
        const args = ['compose', '-f', dockerComposeYmlPath, ...options, 'up', '-d'];
        printDebug && debugSpawnArgs(args);
        return spawnAsync('docker', args, {printStdout: printDebug, printStderr: printDebug});
    }

    export async function composeDown(
        dockerComposeYmlPath: string,
        options: string[] = [],
        printDebug: boolean
    ): Promise<SpawnAsyncResult> {
        const args = ['compose', '-f', dockerComposeYmlPath, ...options, 'down'];
        printDebug && debugSpawnArgs(args);
        return spawnAsync('docker', args, {printStdout: printDebug, printStderr: printDebug});
    }
}
