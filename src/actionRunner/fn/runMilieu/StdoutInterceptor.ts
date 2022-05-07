import interceptStdoutLib, {UnhookInterceptFunction} from "intercept-stdout";
import {getTransformStream, OutputTransform} from "../../../runOptions/OutputTransform";
import {Duplex} from "stream";

export class StdoutInterceptor {
    private readonly _printStdout: boolean;
    private readonly _stdoutTransformStream: Duplex|undefined;
    private readonly _printStderr: boolean;
    private readonly _stderrTransformStream: Duplex|undefined;
    private _stdoutData: string = '';
    private _stderrData: string = '';
    private readonly _unhook: UnhookInterceptFunction;

    static start(
        printStdout: boolean,
        stdoutTransform: OutputTransform,
        printStderr: boolean,
        stderrTransform: OutputTransform
    ): StdoutInterceptor {
        return new StdoutInterceptor(
            printStdout,
            stdoutTransform,
            printStderr,
            stderrTransform,
            interceptStdoutLib
        )
    }

    private constructor(
        printStdout: boolean,
        stdoutTransform: OutputTransform,
        printStderr: boolean,
        stderrTransform: OutputTransform,
        startInterceptFn: typeof interceptStdoutLib
    ) {
        this._printStdout = printStdout;
        this._stdoutTransformStream = getTransformStream(stdoutTransform);
        this._printStderr = printStderr;
        this._stderrTransformStream = getTransformStream(stderrTransform);
        this._unhook = startInterceptFn(
            this.onStdoutData.bind(this),
            this.onStderrData.bind(this)
        );
    }

    unHook(): void {
        // We use unHook() signal to
        // send the remaining data from this._stdoutTransformStream to stdout
        if (this._stdoutTransformStream) {
            this._stdoutTransformStream.end(() => {
                const ending = this._stdoutTransformStream?.read();
                if (ending) {
                    process.stdout.write(ending);
                }
            })
        }
        // We use unHook() signal to
        // send the remaining data from this._stderrTransformStream to stdout
        if (this._stderrTransformStream) {
            this._stderrTransformStream.end(() => {
                const ending = this._stderrTransformStream?.read();
                if (ending) {
                    process.stderr.write(ending);
                }
            })
        }
        this._unhook();
    }

    get interceptedStdout(): string {
        return this._stdoutData;
    }

    get interceptedStderr(): string {
        return this._stderrData;
    }

    private onStdoutData(str: string): string|undefined {
        this._stdoutData += str;
        if (!this._printStdout) {
            return '';
        }
        if (this._stdoutTransformStream) {
            this._stdoutTransformStream.write(str, 'utf8');
            const sanitized = this._stdoutTransformStream.read();
            return sanitized ? sanitized.toString() : '';
        }
        return undefined;
    }

    private onStderrData(str: string): string|undefined {
        this._stderrData += str;
        if (!this._printStderr) {
            return '';
        }
        if (this._stderrTransformStream) {
            this._stderrTransformStream.write(str, 'utf8');
            const sanitized = this._stderrTransformStream.read();
            return sanitized ? sanitized.toString() : '';
        }
        return undefined;
    }
}