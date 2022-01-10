import {actionsFileCommands} from "./fileCommands";
import {RestoreFsStateFn, saveFileCommandsState} from "./saveFsState";
import {CommandsExtractor} from "./CommandsExtractor";
import {StdoutInterceptor} from "./stdoutInterceptor";
import {RestoreProcessPropsFn, saveProcessProps} from "./saveProcessProps";
import {FileStateRecoveryPoint} from "./FileStateRecoveryPoint";
import {CompositeCollectedCommandsStorage} from "./CompositeCollectedCommandsStorage";

export class TestLifecycleHelper {
    private _started: boolean = false;
    private readonly _interceptStderr: boolean;
    private readonly _suppressOutput: boolean;
    private readonly _parseStdoutCommands: boolean;
    private readonly _fileCommandsToRestore: string[];
    private readonly _doRestoreProcessProps: boolean;

    private _restoreFsState: RestoreFsStateFn|undefined;
    private _restoreProcessProps: RestoreProcessPropsFn|undefined;
    private _commandsExtractor: CommandsExtractor|undefined;
    private _stdoutInterceptor: StdoutInterceptor|undefined;

    constructor(
        interceptStderr: boolean = false,
        suppressOutput: boolean = true,
        parseStdoutCommands: boolean = true,
        fileCommandsToRestore: string[] = [actionsFileCommands.PATH, actionsFileCommands.ENV],
        restoreProcessProps: boolean = true
    ) {
        this._interceptStderr = interceptStderr;
        this._suppressOutput = suppressOutput;
        this._parseStdoutCommands = parseStdoutCommands;
        this._fileCommandsToRestore = fileCommandsToRestore;
        this._doRestoreProcessProps = restoreProcessProps;
        this._started = false;
    }

    get collectedCommands(): CompositeCollectedCommandsStorage {
        if (!this._started) {
            throw new Error('Test has not been started!');
        }
        return new CompositeCollectedCommandsStorage(this._commandsExtractor, () => this._started)
    }

    beforeTest(): void {
        if (this._started) {
            throw new Error('Test has been already started!');
        }
        if (this._doRestoreProcessProps) {
            this._restoreProcessProps = saveProcessProps();
        }
        if (this._fileCommandsToRestore.length > 0) {
            this._restoreFsState = saveFileCommandsState(
                this._fileCommandsToRestore, FileStateRecoveryPoint.create
            )
        }
        this._commandsExtractor = this._parseStdoutCommands
            ? new CommandsExtractor()
            : undefined;
        this._stdoutInterceptor = new StdoutInterceptor(
            this._suppressOutput,
            this._interceptStderr,
            this._commandsExtractor
        );
        this._started = true;
    }

    afterTest(): void {
        if (!this._started) {
            throw new Error('Test has not been started or!');
        }
        this._restoreFsState && this._restoreFsState();
        this._restoreProcessProps && this._restoreProcessProps();
        this._stdoutInterceptor &&
            this._stdoutInterceptor?.unHook() &&
            this._stdoutInterceptor?.clearInterceptedData();
        this._restoreFsState = undefined;
        this._restoreProcessProps = undefined;
        this._stdoutInterceptor = undefined;
        this._commandsExtractor = undefined;
        this._started = false;
    }
}