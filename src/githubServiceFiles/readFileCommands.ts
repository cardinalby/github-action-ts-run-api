import fs from "fs-extra";
import {StringKeyValueObj} from "../types/StringKeyValueObj";
import assert from "assert";
import {unescapeCommandValue} from "../utils/commandsEscaping";

function readFileCommandLines(filePath: string, eol: string): string[] {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const lines = fs.readFileSync(filePath).toString('utf-8').split(eol);
    if (lines[lines.length - 1].length === 0) {
        lines.pop();
    }
    return lines;
}

export function readKvPairsFromFileCommand(filePath: string, eol: string): StringKeyValueObj {
    enum ExpectedToken {
        NAME_OR_ONE_LINER, VALUE, VALUE_LINE_OR_FINISH_DELIMITER
    }

    const lines = readFileCommandLines(filePath, eol);
    const kvPairs: StringKeyValueObj = {};
    let expectedToken: ExpectedToken = ExpectedToken.NAME_OR_ONE_LINER;
    let name: string | undefined = undefined;
    let delimiter: string | undefined = undefined;
    let value: string | undefined = undefined;
    for (let line of lines) {
        switch (expectedToken) {
            case ExpectedToken.NAME_OR_ONE_LINER:
                const nameAndDelimiter = line.split('<<');
                if (nameAndDelimiter.length == 2) {
                    [name, delimiter] = nameAndDelimiter;
                    expectedToken = ExpectedToken.VALUE;
                    break;
                }
                const nameAndValue = line.split('=');
                if (nameAndValue.length == 2) {
                    kvPairs[nameAndValue[0]] = nameAndValue[1];
                    name = undefined;
                    value = undefined;
                    expectedToken = ExpectedToken.NAME_OR_ONE_LINER;
                    break;
                }
                console.warn(`Error parsing ${filePath} commands file. ` +
                    'Expected line is either in VAR=VAL format or VAR<<delimiter. Read line');
                console.warn(line);
                break;
            case ExpectedToken.VALUE:
                value = unescapeCommandValue(line);
                expectedToken = ExpectedToken.VALUE_LINE_OR_FINISH_DELIMITER;
                break;
            case ExpectedToken.VALUE_LINE_OR_FINISH_DELIMITER:
                assert(delimiter !== undefined);
                if (line === delimiter) {
                    assert(name !== undefined && value !== undefined);
                    kvPairs[name] = value;
                    expectedToken = ExpectedToken.NAME_OR_ONE_LINER;
                    name = undefined;
                    value = undefined;
                } else {
                    assert(value !== undefined);
                    value += eol + line;
                }
        }
    }
    return kvPairs;
}

export function readValuesFromFileCommand(filePath: string, eol: string): string[] {
    return readFileCommandLines(filePath, eol).map(unescapeCommandValue);
}