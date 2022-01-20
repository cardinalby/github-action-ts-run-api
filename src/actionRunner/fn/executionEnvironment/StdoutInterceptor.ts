import interceptStdoutLib, {InterceptFunction, UnhookInterceptFunction} from "intercept-stdout";

export interface StdoutInterceptorInterface {
    unHook(): void
    clearInterceptedData(): void;
    get interceptedData(): string;
}

export class StdoutInterceptor implements StdoutInterceptorInterface {
    private readonly _printOutput: boolean;
    private _data: string = '';
    private readonly _unhook: UnhookInterceptFunction;

    static start(printOutput: boolean): StdoutInterceptor {
        return new StdoutInterceptor(
            printOutput,
            interceptStdoutLib
        )
    }

    private constructor(
        printOutput: boolean,
        startInterceptFn: (fn: InterceptFunction) => UnhookInterceptFunction
    ) {
        this._printOutput = printOutput;
        this._unhook = startInterceptFn(this.onData.bind(this));
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
        return this._printOutput ? undefined : '';
    }
}