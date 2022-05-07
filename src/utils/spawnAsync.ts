import {ChildProcessWithoutNullStreams, spawn, SpawnSyncReturns} from "child_process";
import {URL} from "node:url";
import {WritableStreamBuffer} from "./WritableStreamBuffer";
import {Duration} from "./Duration";
import {getTransformStream, OutputTransform} from "../runOptions/OutputTransform";

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
     * @default {OutputTransform.NONE}
     */
    stdoutTransform?: OutputTransform;
    /**
     * @default false
     */
    printStderr?: boolean

    /**
     * Sets the way stderr will be transformed before printing (if printStderr == true)
     *
     * @default {OutputTransform.NONE}
     */
    stderrTransform?: OutputTransform;

    /**
     * Callback called after child process was spawned
     */
    onSpawn?: (child: ChildProcessWithoutNullStreams) => void;
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

    if (options.onSpawn) {
        options.onSpawn(child);
    }

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

    const pipeOutput = (
        childOutput: NodeJS.ReadableStream,
        processOutput: NodeJS.WritableStream,
        print: boolean,
        transformPrint: OutputTransform
    ): WritableStreamBuffer => {
        if (print) {
            const transformStream = getTransformStream(transformPrint);
            const src = transformStream ? childOutput.pipe(transformStream) : childOutput;
            src.pipe(processOutput);
        }
        const buffer = new WritableStreamBuffer();
        childOutput.pipe(buffer);
        return buffer;
    }

    const stdoutBuffer = pipeOutput(
        child.stdout, process.stdout, !!options.printStdout, options.stdoutTransform || OutputTransform.NONE
    );

    const stderrBuffer = pipeOutput(
        child.stderr, process.stderr, !!options.printStderr, options.stderrTransform || OutputTransform.NONE
    );

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
