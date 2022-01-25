import {StringKeyValueObj} from "../types/StringKeyValueObj";

export type EchoCommandMessage = 'on'|'off'|undefined;

export interface ParsedFileCommandsInterface {
    addedPaths: string[];
    exportedVars: StringKeyValueObj;
}

export interface StdoutCommandsInterface {
    warnings: string[];
    errors: string[];
    notices: string[];
    debugs: string[];
    savedState: StringKeyValueObj;
    secrets: string[];
    echo: EchoCommandMessage;
    outputs: StringKeyValueObj;
}

export interface ParsedCommandsInterface extends ParsedFileCommandsInterface, StdoutCommandsInterface {
}