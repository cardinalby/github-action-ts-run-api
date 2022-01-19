import {StringKeyValueObj} from "../types/StringKeyValueObj";

export type EchoCommandMessage = 'on'|'off'|undefined;

export interface CommandsStoreInterface {
    get warnings(): string[];
    get errors(): string[];
    get notices(): string[];
    get debugs(): string[];
    get savedState(): StringKeyValueObj;
    get secrets(): string[];
    get echo(): EchoCommandMessage;
    get outputs(): StringKeyValueObj;
    get addedPaths(): string[];
    get exportedVars(): StringKeyValueObj;
}