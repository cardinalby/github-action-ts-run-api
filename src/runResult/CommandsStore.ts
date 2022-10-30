import {ParsedCommandsInterface, ParsedFileCommandsInterface, StdoutCommandsInterface} from "./ParsedCommandsInterface";
import {AbstractStore} from "../utils/AbstractStore";
import {StdoutCommandInterface} from "../stdout/StdoutCommandInterface";
import {StdoutCommandName} from "../stdout/StdoutCommandName";

export class CommandsStore extends AbstractStore<ParsedCommandsInterface> {
    static create(stdoutCommands: StdoutCommandsInterface, fileCommands: ParsedFileCommandsInterface) {
        const store = new CommandsStore();
        store.apply(stdoutCommands)
        store.applyAndMerge(fileCommands)
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

    applyAndMerge(changes: Partial<ParsedCommandsInterface>): this {
        for (let [name, value] of Object.entries(changes)) {
            if (value !== undefined) {
                const srcValue = (this._data as any)[name];
                if (srcValue === undefined ||
                    typeof srcValue === 'number' ||
                    typeof srcValue === 'string'
                ) {
                    (this._data as any)[name] = value
                } else if (Array.isArray(srcValue)) {
                    if (!Array.isArray(value)) {
                        throw new Error(`${name} key in changes is not an array`);
                    }
                    srcValue.push(...value);
                } else if (typeof srcValue === 'object' && srcValue !== null) {
                    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
                        throw new Error(`${name} key in changes is not an object`);
                    }
                    Object.assign(srcValue, value);
                }
            }
        }
        return this;
    }

    addStdoutCommand(cmd: StdoutCommandInterface): this {
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
                // TODO: deprecation
                // https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/
                if (cmd.properties.name !== undefined) {
                    this.data.savedState[cmd.properties.name] = cmd.message;
                }
                break;
            }
            case StdoutCommandName.ADD_MASK:
                this.data.secrets.push(cmd.message);
                break;
            case StdoutCommandName.SET_OUTPUT:
                // TODO: deprecation
                // https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/
                if (cmd.properties.name !== undefined) {
                    this.data.outputs[cmd.properties.name] = cmd.message;
                }
                break;
            case StdoutCommandName.ADD_PATH:
                // TODO: deprecation
                // https://github.blog/changelog/2020-10-01-github-actions-deprecating-set-env-and-add-path-commands/
                this.data.addedPaths.push(cmd.message);
                break;
            case StdoutCommandName.ECHO:
                if (cmd.message === 'on' || cmd.message === 'off') {
                    this.data.echo = cmd.message;
                }
                break;
            case StdoutCommandName.SET_ENV:
                // TODO: deprecation
                // https://github.blog/changelog/2020-10-01-github-actions-deprecating-set-env-and-add-path-commands/
                if (cmd.properties.name !== undefined) {
                    this.data.exportedVars[cmd.properties.name] = cmd.message;
                }
                break;
        }
        return this;
    }
}