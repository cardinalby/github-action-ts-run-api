import {ParsedCommandsInterface} from "./ParsedCommandsInterface";
import {AbstractStore} from "./AbstractStore";

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

export class CommandsStore extends AbstractStore<ParsedCommandsInterface> {
    static create(...commands: Partial<ParsedCommandsInterface>[]) {
        const store = new CommandsStore();
        commands.forEach(cmd => store.apply(cmd));
        return store;
    }

    constructor() {
        super({
            warnings: [],
            errors: [],
            notices: [],
            debugs: [],
            savedState: {},
            secrets: [],
            outputs: {},
            addedPaths: [],
            exportedVars: {},
            echo: undefined
        });
    }

    addCommand(cmd: CommandInterface): this {
        if (cmd.message === undefined) {
            return this;
        }
        switch (cmd.command) {
            case StdoutCommandName.ERROR:
                this.data.errors.push(cmd.message);
                break;
            case StdoutCommandName.WARNING:
                this.data.warnings.push(cmd.message);
                break;
            case StdoutCommandName.NOTICE:
                this.data.notices.push(cmd.message);
                break;
            case StdoutCommandName.DEBUG:
                this.data.debugs.push(cmd.message);
                break;
            case StdoutCommandName.SAVE_STATE: {
                if (cmd.properties.name !== undefined) {
                    this.data.savedState[cmd.properties.name] = cmd.message;
                }
                break;
            }
            case StdoutCommandName.ADD_MASK:
                this.data.secrets.push(cmd.message);
                break;
            case StdoutCommandName.SET_OUTPUT:
                if (cmd.properties.name !== undefined) {
                    this.data.outputs[cmd.properties.name] = cmd.message;
                }
                break;
            case StdoutCommandName.ADD_PATH:
                this.data.addedPaths.push(cmd.message);
                break;
            case StdoutCommandName.ECHO:
                if (cmd.message === 'on' || cmd.message === 'off') {
                    this.data.echo = cmd.message;
                }
                break;
            case StdoutCommandName.SET_ENV:
                if (cmd.properties.name !== undefined) {
                    this.data.exportedVars[cmd.properties.name] = cmd.message;
                }
                break;
        }
        return this;
    }
}