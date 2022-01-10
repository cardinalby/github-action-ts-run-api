import {unescapeCommandValue, unescapePropertyValue} from "./dataEscaping";

export interface GithubActionCommand {
    command: string,
    properties: {[key: string]: string},
    message: string|undefined
}

export const actionsStdoutCommands = {
    error: 'error',
    warning: 'warning',
    notice: 'notice',
    debug: 'debug',
    group: 'group',
    endgroup: 'endgroup',
    saveState: 'save-state',
    addMask: 'add-mask',
    addPath: 'add-path',
    echo: 'echo',
    setEnv: 'set-env',
    setOutput: 'set-output'
}
//\r?\n

export function parseCommand(str: string): GithubActionCommand|undefined {
    const cmdRegexp = /^::([A-Za-z0-9\-_.]+?)(\s.+)?::(.*)?$/m;
    const regexpResult = cmdRegexp.exec(str);
    if (!regexpResult) {
        return undefined;
    }
    // noinspection JSUnusedLocalSymbols
    const [cmd, cmdName, cmdProperties, cmdMessage] = regexpResult;
    let properties: {[key: string]: string} = {};
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

