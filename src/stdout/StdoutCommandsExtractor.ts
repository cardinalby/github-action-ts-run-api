import {CommandsStore, CommandInterface} from "../stores/CommandsStore";
import {unescapeCommandValue, unescapePropertyValue} from "../utils/commandsEscaping";

export class StdoutCommandsExtractor {
    private _unprocessedLine = '';
    private _commands = new CommandsStore();

    static extract(stdoutData: string): CommandsStore {
        const extractor = new StdoutCommandsExtractor();
        extractor.onStdoutData(stdoutData);
        return extractor.commands;
    }

    get commands(): CommandsStore {
        return this._commands;
    }

    onStdoutData(data: string) {
        this._unprocessedLine += data;
        const lines = this._unprocessedLine.split(/\r?\n/);
        if (lines.length > 1) {
            for (let i = 0; i < lines.length - 1; ++i) {
                if (lines[i]) {
                    const cmd = StdoutCommandsExtractor.parseStdoutCommand(lines[i]);
                    if (cmd !== undefined) {
                        this._commands.addCommand(cmd);
                    }
                }
            }
            this._unprocessedLine = lines[lines.length - 1];
        }
    }

    static parseStdoutCommand(str: string): CommandInterface | undefined {
        const cmdRegexp = /^::([A-Za-z0-9\-_.]+?)(\s.+)?::(.*)?$/m;
        const regexpResult = cmdRegexp.exec(str);
        if (!regexpResult) {
            return undefined;
        }
        // noinspection JSUnusedLocalSymbols
        const [cmd, cmdName, cmdProperties, cmdMessage] = regexpResult;
        let properties: { [key: string]: string } = {};
        if (cmdProperties) {
            cmdProperties.trimLeft().split(',').forEach(expression => {
                const expressionParts = expression.split('=');
                if (expressionParts.length === 2) {
                    let [propKey, propValue] = expressionParts;
                    propValue = unescapePropertyValue(propValue);
                    properties[propKey] = propValue;
                }
            })
        }

        return {
            command: cmdName,
            properties,
            message: cmdMessage ? unescapeCommandValue(cmdMessage) : undefined
        }
    }
}