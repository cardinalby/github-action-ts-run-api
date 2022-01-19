import {CommandsStoreInterface, EchoCommandMessage} from "./CommandsStoreInterface";
import {StringKeyValueObj} from "../types/StringKeyValueObj";

export enum StdoutCommandName {
    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    ERROR = 'error',
    WARNING = 'warning',
    NOTICE = 'notice',
    DEBUG = 'debug',
    GROUP = 'group',
    END_GROUP = 'endgroup',
    SAVE_STATE = 'save-state',
    ADD_MASK = 'add-mask',
    ADD_PATH = 'add-path',
    ECHO = 'echo',
    SET_ENV = 'set-env',
    SET_OUTPUT = 'set-output'
}

export interface CommandInterface {
    command: StdoutCommandName | string,
    properties: { [key: string]: string },
    message: string | undefined
}

export class CommandsStore implements CommandsStoreInterface {
    warnings: string[] = [];
    errors: string[] = [];
    notices: string[] = [];
    debugs: string[] = [];
    savedState: StringKeyValueObj = {};
    secrets: string[] = [];
    outputs: StringKeyValueObj = {};
    addedPaths: string[] = [];
    exportedVars: StringKeyValueObj = {};
    echo: EchoCommandMessage = undefined;

    addCommand(cmd: CommandInterface): this {
        if (cmd.message === undefined) {
            return this;
        }
        switch (cmd.command) {
            case StdoutCommandName.ERROR:
                this.errors.push(cmd.message);
                break;
            case StdoutCommandName.WARNING:
                this.warnings.push(cmd.message);
                break;
            case StdoutCommandName.NOTICE:
                this.notices.push(cmd.message);
                break;
            case StdoutCommandName.DEBUG:
                this.debugs.push(cmd.message);
                break;
            case StdoutCommandName.SAVE_STATE: {
                if (cmd.properties.name !== undefined) {
                    this.savedState[cmd.properties.name] = cmd.message;
                }
                break;
            }
            case StdoutCommandName.ADD_MASK:
                this.secrets.push(cmd.message);
                break;
            case StdoutCommandName.SET_OUTPUT:
                if (cmd.properties.name !== undefined) {
                    this.outputs[cmd.properties.name] = cmd.message;
                }
                break;
            case StdoutCommandName.ADD_PATH:
                this.addedPaths.push(cmd.message);
                break;
            case StdoutCommandName.ECHO:
                if (cmd.message === 'on' || cmd.message === 'off') {
                    this.echo = cmd.message;
                }
                break;
            case StdoutCommandName.SET_ENV:
                if (cmd.properties.name !== undefined) {
                    this.exportedVars[cmd.properties.name] = cmd.message;
                }
                break;
        }
        return this;
    }
}