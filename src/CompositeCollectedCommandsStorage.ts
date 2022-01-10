import {CollectedCommandsStorage, EchoCommandMessage, StringKeyValueObj} from "./CommandsExtractor";
import {getAddedPathsFromFileCommand, getExportedVarsFromFileCommand} from "./fileCommands";

export class CompositeCollectedCommandsStorage implements CollectedCommandsStorage {
    private readonly _stdoutCollectedCommands: CollectedCommandsStorage|undefined;
    private readonly _checkInTest: () => boolean;

    constructor(
        stdoutCollectedCommands: CollectedCommandsStorage|undefined,
        checkInTest: () => boolean
    ) {
        this._stdoutCollectedCommands = stdoutCollectedCommands;
        this._checkInTest = checkInTest;
    }

    get addedPaths(): string[] {
        this.assertInTest();
        const fromFileCmd = getAddedPathsFromFileCommand();
        if (fromFileCmd) {
            return fromFileCmd;
        }
        return this.assertStdoutCollectedCommands().addedPaths;
    }

    get exportedEnvs(): StringKeyValueObj {
        this.assertInTest();
        const fromFileCmd = getExportedVarsFromFileCommand();
        if (fromFileCmd) {
            return fromFileCmd;
        }
        return this.assertStdoutCollectedCommands().exportedEnvs;
    }

    get errors(): string[] {
        return this.assertStdoutCollectedCommands().errors;
    }

    get notices(): string[] {
        return this.assertStdoutCollectedCommands().notices;
    }

    get debugs(): string[] {
        return this.assertStdoutCollectedCommands().debugs;
    }

    get savedState(): StringKeyValueObj {
        return this.assertStdoutCollectedCommands().savedState;
    }

    get secrets(): string[] {
        return this.assertStdoutCollectedCommands().secrets;
    }

    get outputs(): StringKeyValueObj {
        return this.assertStdoutCollectedCommands().outputs;
    }

    get warnings(): string[] {
        return this.assertStdoutCollectedCommands().warnings;
    }

    get echo(): EchoCommandMessage {
        return this.assertStdoutCollectedCommands().echo;
    }

    private assertStdoutCollectedCommands(): CollectedCommandsStorage {
        if (this._stdoutCollectedCommands === undefined) {
            throw new Error("Stdout commands weren't parsed due to helper options");
        }
        return this._stdoutCollectedCommands;
    }

    private assertInTest() {
        if (!this._checkInTest()) {
            throw new Error('Getter called outside a test');
        }
    }
}