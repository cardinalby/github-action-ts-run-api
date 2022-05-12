import interceptStdoutLib, {UnhookInterceptFunction} from "intercept-stdout";
import {getTransformStream, OutputTransform} from "../../../runOptions/OutputTransform";
import {Duplex} from "stream";
import {OutputsCommandsCollector} from "../../../stdout/OutputsCommandsCollector";
import {CommandsStore} from "../../../runResult/CommandsStore";

export class StdoutInterceptor {
    private readonly _printStdout: boolean;
    private readonly _stdoutTransformStream: Duplex|undefined;
    private readonly _printStderr: boolean;
    private readonly _stderrTransformStream: Duplex|undefined;
    private _stdoutData: string = '';
    private _stderrData: string = '';
    private readonly _unhook: UnhookInterceptFunction;
    private _commandsCollector: OutputsCommandsCollector;

    static start(
        printStdout: boolean,
        stdoutTransform: OutputTransform,
        printStderr: boolean,
        stderrTransform: OutputTransform,
        parseStdoutCommands: boolean = false,
        parseStderrCommands: boolean = false,
    ): StdoutInterceptor {
        return new StdoutInterceptor(
            printStdout,
            stdoutTransform,
            printStderr,
            stderrTransform,
            interceptStdoutLib,
            parseStdoutCommands,
            parseStderrCommands
        )
    }

    private constructor(
        printStdout: boolean,
        stdoutTransform: OutputTransform,
        printStderr: boolean,
        stderrTransform: OutputTransform,
        startInterceptFn: typeof interceptStdoutLib,
        parseStdoutCommands: boolean,
        parseStderrCommands: boolean
    ) {
        this._printStdout = printStdout;
        this._stdoutTransformStream = getTransformStream(stdoutTransform);
        this._printStderr = printStderr;
        this._stderrTransformStream = getTransformStream(stderrTransform);
        this._unhook = startInterceptFn(
            this.onStdoutData.bind(this),
            this.onStderrData.bind(this)
        );
        this._commandsCollector = new OutputsCommandsCollector(parseStdoutCommands, parseStderrCommands);
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

        this.finishCommandsParsing();
        this._unhook();
    }

    get interceptedStdout(): string {
        return this._stdoutData;
    }

    get interceptedStderr(): string {
        return this._stderrData;
    }

    finishCommandsParsing() {
        if (this._commandsCollector.stdoutParsingStream && !this._commandsCollector.stdoutParsingStream.closed) {
            this._commandsCollector.stdoutParsingStream.end();
            this._commandsCollector.stdoutParsingStream.destroy();
        }
        if (this._commandsCollector.stderrParsingStream && !this._commandsCollector.stderrParsingStream.closed) {
            this._commandsCollector.stderrParsingStream.end();
            this._commandsCollector.stderrParsingStream.destroy();
        }
    }

    get parsedCommands(): CommandsStore {
        return this._commandsCollector.commandsStore;
    }

    private onStdoutData(str: string): string|undefined {
        this._stdoutData += str;
        if (this._commandsCollector.stdoutParsingStream) {
            this._commandsCollector.stdoutParsingStream.write(str, () => {});
        }
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
        if (this._commandsCollector.stderrParsingStream) {
            this._commandsCollector.stderrParsingStream.write(str, () => {});
        }
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