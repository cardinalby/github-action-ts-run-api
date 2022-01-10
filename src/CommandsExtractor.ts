import {actionsStdoutCommands, GithubActionCommand, parseCommand} from "./parseCommand";
import {StdoutDataListener} from "./stdoutInterceptor";

export interface StringKeyValueObj {
    [name: string]: string|undefined
}

export type EchoCommandMessage = 'on'|'off'|undefined;

export interface CollectedCommandsStorage {
    get warnings(): string[];
    get errors(): string[];
    get notices(): string[];
    get debugs(): string[];
    get savedState(): StringKeyValueObj;
    get secrets(): string[];
    get outputs(): StringKeyValueObj;
    get addedPaths(): string[];
    get exportedEnvs(): StringKeyValueObj;
    get echo(): EchoCommandMessage;
}

export class CommandsExtractor implements StdoutDataListener, CollectedCommandsStorage {
    private _unprocessedLine: string = '';

    readonly warnings: string[] = [];
    readonly errors: string[] = [];
    readonly notices: string[] = [];
    readonly debugs: string[] = [];
    readonly savedState: StringKeyValueObj = {};
    readonly secrets: string[] = [];
    readonly outputs: StringKeyValueObj = {};
    readonly addedPaths: string[] = [];
    readonly exportedEnvs: StringKeyValueObj = {};
    echo: EchoCommandMessage = undefined;

    onStdoutData(data: string) {
        this._unprocessedLine += data;
        const lines = this._unprocessedLine.split(/\r?\n/);
        if (lines.length > 1) {
            for (let i = 0; i < lines.length - 1; ++i) {
                if (lines[i]) {
                    const cmd = parseCommand(lines[i]);
                    if (cmd !== undefined) {
                        this.handleCommand(cmd);
                    }
                }
            }
            this._unprocessedLine = lines[lines.length - 1];
        }
    }

    private handleCommand(cmd: GithubActionCommand) {
        if (cmd.message === undefined) {
            return;
        }
        switch (cmd.command) {
            case actionsStdoutCommands.error:
                this.errors.push(cmd.message);
                break;
            case actionsStdoutCommands.warning:
                this.warnings.push(cmd.message);
                break;
            case actionsStdoutCommands.notice:
                this.notices.push(cmd.message);
                break;
            case actionsStdoutCommands.debug:
                this.debugs.push(cmd.message);
                break;
            case actionsStdoutCommands.saveState: {
                if (cmd.properties.name !== undefined) {
                    this.savedState[cmd.properties.name] = cmd.message;
                }
                break;
            }
            case actionsStdoutCommands.addMask:
                this.secrets.push(cmd.message);
                break;
            case actionsStdoutCommands.setOutput:
                if (cmd.properties.name !== undefined) {
                    this.outputs[cmd.properties.name] = cmd.message;
                }
                break;
            case actionsStdoutCommands.addPath:
                this.addedPaths.push(cmd.message);
                break;
            case actionsStdoutCommands.echo:
                if (cmd.message === 'on' || cmd.message === 'off') {
                    this.echo = cmd.message;
                }
                break;
            case actionsStdoutCommands.setEnv:
                if (cmd.properties.name !== undefined) {
                    this.exportedEnvs[cmd.properties.name] = cmd.message;
                }
                break;
        }
    }
}