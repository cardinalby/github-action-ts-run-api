import {spawn, SpawnSyncReturns} from "child_process";
import {URL} from "node:url";
import {WritableStreamBuffer} from "./WritableStreamBuffer";
import {Duration} from "./Duration";
import {getTransformStream, StdoutTransform} from "../runOptions/StdoutTransform";

export interface SpawnAsyncOptions {
    timeout?: number;
    cwd?: string | URL | undefined;
    env?: NodeJS.ProcessEnv | undefined;
    /**
     * @default false
     */
    printStdout?: boolean,
    /**
     * Sets the way stdout will be transformed before printing (if printStdout == true)
     *
     * @default {StdoutTransform.NONE}
     */
    stdoutTransform?: StdoutTransform;
    /**
     * @default false
     */
    printStderr?: boolean
}

export interface SpawnAsyncResult extends SpawnSyncReturns<string> {
    pid: number;
    stdout: string;
    stderr: string;
    status: number | null;
    signal: NodeJS.Signals | null;
    error?: Error | undefined;
    timedOut: boolean;
    duration: number;
}

export async function spawnAsync(
    command: string,
    args: ReadonlyArray<string>,
    options: SpawnAsyncOptions = {}
): Promise<SpawnAsyncResult> {
    const duration = Duration.startMeasuring();
    const child = spawn(command, args, {
        env: options.env,
        cwd: options.cwd
    });

    const spawnResult: SpawnAsyncResult = {
        error: undefined,
        output: [],
        stdout: '',
        stderr: '',
        pid: child.pid || 0,
        status: null,
        signal: null,
        duration: 0,
        timedOut: false
    }

    if (options.printStdout) {
        const transformStream = getTransformStream(options.stdoutTransform || StdoutTransform.NONE);
        const src = transformStream ? child.stdout.pipe(transformStream) : child.stdout;
        src.pipe(process.stdout);
    }

    const stdoutBuffer = new WritableStreamBuffer();
    child.stdout.pipe(stdoutBuffer);

    if (options.printStderr) {
        child.stdout.pipe(process.stderr);
    }

    const stderrBuffer = new WritableStreamBuffer();
    child.stderr.pipe(stderrBuffer);

    return new Promise(resolve => {
        const killTimeout = options.timeout && setTimeout(() => {
            spawnResult.timedOut = true;
            if (child.kill() && child.killed) {
                const error = new Error('Timed out') as NodeJS.ErrnoException;
                error.code = 'ETIMEDOUT';
                spawnResult.error = error
            }
            resolveSpawn();
        }, options.timeout);

        const resolveSpawn = () => {
            killTimeout && clearTimeout(killTimeout);
            spawnResult.duration = duration.measureMs();
            spawnResult.stdout = stdoutBuffer.getContentsAsString() || '';
            spawnResult.stderr = stderrBuffer.getContentsAsString() || '';
            resolve(spawnResult);
        }
        child.once('error', err => {
            spawnResult.error = err;
            spawnResult.signal = child.signalCode;
            resolveSpawn();
        });

        child.once('close', (code, signal) => {
            spawnResult.signal = signal;
            spawnResult.status = code;
            resolveSpawn();
        });
    });
}
