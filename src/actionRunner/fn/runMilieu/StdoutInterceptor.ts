import interceptStdoutLib, {UnhookInterceptFunction} from "intercept-stdout";

export class StdoutInterceptor {
    private readonly _printStdout: boolean;
    private readonly _printStderr: boolean;
    private _stdoutData: string = '';
    private _stderrData: string = '';
    private readonly _unhook: UnhookInterceptFunction;

    static start(printStdout: boolean, printStderr: boolean): StdoutInterceptor {
        return new StdoutInterceptor(
            printStdout,
            printStderr,
            interceptStdoutLib
        )
    }

    private constructor(
        printStdout: boolean,
        printStderr: boolean,
        startInterceptFn: typeof interceptStdoutLib
    ) {
        this._printStdout = printStdout;
        this._printStderr = printStderr;
        this._unhook = startInterceptFn(
            this.onStdoutData.bind(this),
            this.onStderrData.bind(this)
        );
    }

    unHook(): void {
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
        return this._printStdout ? undefined : '';
    }

    private onStderrData(str: string): string|undefined {
        this._stderrData += str;
        return this._printStderr ? undefined : '';
    }
}