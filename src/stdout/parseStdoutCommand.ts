import {unescapeCommandValue, unescapePropertyValue} from "../utils/commandsEscaping";
import {stdoutCmdWithParamRegexp, StdoutCommandInterface} from "./stdoutCommands";

export function parseStdoutCommand(str: string): StdoutCommandInterface | undefined {
    const regexpResult = stdoutCmdWithParamRegexp.exec(str);
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