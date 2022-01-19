import fs from "fs-extra";
import os from "os";
import {StringKeyValueObj} from "../types/StringKeyValueObj";
import assert from "assert";
import {unescapeCommandValue} from "../utils/commandsEscaping";

export function readFileCommandLines(filePath: string): string[] {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const lines = fs.readFileSync(filePath).toString('utf-8').split(os.EOL);
    if (lines[lines.length - 1].length === 0) {
        lines.pop();
    }
    return lines;
}

export function readExportedVarsFromFileCommand(filePath: string): StringKeyValueObj {
    // Yes, they have typo in a delimiter string
    // noinspection SpellCheckingInspection
    const delimiter = '_GitHubActionsFileCommandDelimeter_';

    enum ExpectedToken {
        NAME, VALUE, VALUE_LINE_OR_FINISH_DELIMITER
    }

    const lines = readFileCommandLines(filePath);
    const exportedVars: StringKeyValueObj = {};
    let expectedToken: ExpectedToken = ExpectedToken.NAME;
    let name: string | undefined = undefined;
    let value: string | undefined = undefined;
    for (let line of lines) {
        switch (expectedToken) {
            case ExpectedToken.NAME:
                const findValueResult = (new RegExp(`(.+?)<<${delimiter}`)).exec(line);
                if (findValueResult) {
                    name = findValueResult[1];
                    expectedToken = ExpectedToken.VALUE;
                }
                break;
            case ExpectedToken.VALUE:
                value = unescapeCommandValue(line);
                expectedToken = ExpectedToken.VALUE_LINE_OR_FINISH_DELIMITER;
                break;
            case ExpectedToken.VALUE_LINE_OR_FINISH_DELIMITER:
                if (line === delimiter) {
                    assert(name !== undefined && value !== undefined);
                    exportedVars[name] = value;
                    expectedToken = ExpectedToken.NAME;
                    name = undefined;
                    value = undefined;
                } else {
                    assert(value !== undefined);
                    value += os.EOL + line;
                }
        }
    }
    return exportedVars;
}

export function readAddedPathsFromFileCommand(filePath: string): string[] {
    return readFileCommandLines(filePath).map(unescapeCommandValue);
}