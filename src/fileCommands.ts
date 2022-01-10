import fs from "fs-extra";
import * as os from "os";
import {unescapeCommandValue} from "./dataEscaping";
import {StringKeyValueObj} from "./CommandsExtractor";

export function getFileCommandPath(name: string): string|undefined {
    return process.env[`GITHUB_${name}`];
}

function getFileCommandLines(name: string): string[]|undefined {
    const filePath = getFileCommandPath(name);
    if (!filePath || !fs.existsSync(filePath)) {
        return undefined;
    }
    const lines = fs.readFileSync(filePath).toString('utf-8').split(os.EOL);
    if (lines[lines.length-1].length === 0) {
        lines.pop();
    }
    return lines;
}

export const actionsFileCommands = {
    PATH: 'PATH',
    ENV: 'ENV'
}

export function getFileCommandMessages(command: string): string[]|undefined {
    const lines = getFileCommandLines(command);
    return (lines && lines.map(msg => unescapeCommandValue(msg))) || undefined;
}

export function getAddedPathsFromFileCommand(): string[]|undefined {
    return getFileCommandMessages(actionsFileCommands.PATH);
}

export function getExportedVarsFromFileCommand(): StringKeyValueObj|undefined {
    const delimiter = '_GitHubActionsFileCommandDelimeter_';
    const lines = getFileCommandLines(actionsFileCommands.ENV);
    if (lines === undefined) {
        return undefined;
    }
    const exportedVars: StringKeyValueObj = {};
    let state: 'wait_name'|'wait_value'|'wait_finish_delimiter' = 'wait_name';
    let name: string|undefined = undefined;
    let value: string|undefined = undefined;
    for (let line of lines) {
        switch (state) {
            case "wait_name":
                const findValueResult = (new RegExp(`(.+?)<<${delimiter}`)).exec(line);
                if (findValueResult) {
                    name = findValueResult[1];
                    state = 'wait_value';
                }
                break;
            case "wait_value":
                value = unescapeCommandValue(line);
                state = 'wait_finish_delimiter';
                break;
            case 'wait_finish_delimiter':
                if (line === delimiter) {
                    if (name === undefined || value === undefined) {
                        throw new Error('Logical error while parsing exported env file command');
                    }
                    exportedVars[name] = value;
                    state = 'wait_name';
                    name = undefined;
                    value = undefined;
                } else {
                    value += os.EOL + line;
                }
        }
    }
    return exportedVars;
}