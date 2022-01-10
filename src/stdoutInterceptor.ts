import interceptStdoutLib, {UnhookInterceptFunction} from "intercept-stdout";

export interface StdoutDataListener {
    onStdoutData(data: string): void;
}

export interface StdoutInterceptorInterface {
    unHook(): void
    clearInterceptedData(): void;
    get interceptedData(): string;
}

export class StdoutInterceptor implements StdoutInterceptorInterface {
    private readonly _suppressOutput: boolean;
    private _data: string = '';
    private _stdoutDataListener: StdoutDataListener|undefined;
    private readonly _unhook: UnhookInterceptFunction;

    constructor(
        suppressOutput: boolean,
        interceptStdErr: boolean = false,
        stdoutDataListener: StdoutDataListener|undefined
    ) {
        this._suppressOutput = suppressOutput;
        this._stdoutDataListener = stdoutDataListener;
        const interceptor = this.onData.bind(this);
        this._unhook = interceptStdErr
            ? interceptStdoutLib(interceptor, interceptor)
            : interceptStdoutLib(interceptor);
    }

    unHook(): void {
        this._unhook();
    }

    clearInterceptedData(): void {
        this._data = '';
    }

    get interceptedData(): string {
        return this._data;
    }

    private onData(str: string): string|undefined {
        this._data += str;
        this._stdoutDataListener && this._stdoutDataListener.onStdoutData(str);
        if (this._suppressOutput) {
            return '';
        }
    }
}