import {CommandInterface} from "../runResult/CommandsStore";
import {unescapeCommandValue, unescapePropertyValue} from "../utils/commandsEscaping";

export function parseStdoutCommand(str: string): CommandInterface | undefined {
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