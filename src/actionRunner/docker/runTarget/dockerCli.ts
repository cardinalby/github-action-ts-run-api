import {spawnSync} from "child_process";
import {EnvInterface} from "../../../types/EnvInterface";
import {StringKeyValueObj} from "../../../types/StringKeyValueObj";
import os from "os";
import {spawnAsync, SpawnAsyncResult} from "../../../utils/spawnAsync";

function debugSpawnArgs(args: string[]) {
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
    export function isInstalled() {
        const spawnRes = spawnSync('docker', ['-v'], {encoding: 'utf8'});
        return spawnRes.status === 0 && spawnRes.error === undefined;
    }

    /**
     * @return {string} image id
     */
    export async function build(
        workingDir: string,
        dockerFilePath: string,
        printDebug: boolean
    ): Promise<SpawnAsyncResult> {
        const args = ['build', '-q', '-f', dockerFilePath, workingDir];
        printDebug && debugSpawnArgs(args);
        const result = await spawnAsync('docker', ['build', '-q', '-f', dockerFilePath, workingDir]);
        if (printDebug && result.status == 0 && result.stdout) {
            process.stdout.write(result.stdout + os.EOL);
        }
        return result;
    }

    export async function run(
        imageId: string,
        env: EnvInterface,
        volumes: StringKeyValueObj, // source: target
        workdir: string,
        user: string|undefined,
        network: string|undefined,
        containerArgs: string[],
        timeoutMs: number|undefined,
        printDebug: boolean,
        printStdout: boolean,
        printStderr: boolean
    ): Promise<SpawnAsyncResult> {
        const args = ['run', '--rm'];
        if (user !== undefined) {
            args.push('--user', user)
        }
        args.push('--workdir', workdir);
        Object.entries(volumes).forEach(entry => {
            if (entry[1] !== undefined) {
                args.push('-v', `${entry[0]}:${entry[1]}`);
            }
        });
        Object.entries(env).forEach(entry => {
            if (entry[1] !== undefined) {
                args.push('-e', `${entry[0]}=${entry[1]}`);
            }
        });
        if (network !== undefined) {
            args.push('--network', network);
        }
        args.push(imageId);
        args.push(...containerArgs);
        printDebug && debugSpawnArgs(args);
        return spawnAsync('docker', args, {timeout: timeoutMs, printStdout, printStderr});
    }
}
