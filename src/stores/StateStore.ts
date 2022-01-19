import {StringKeyValueObj} from "../types/StringKeyValueObj";
import assert from "assert";
import {AbstractStore} from "./AbstractStore";

export class StateStore extends AbstractStore<StringKeyValueObj>
{
    toEnvVariables(): StringKeyValueObj {
        return Object.fromEntries(Object.entries(this._data)
            .filter(entry => entry[1] !== undefined)
            .map(entry => {
                    assert(entry[1] !== undefined);
                    return ['STATE_' + entry[0], entry[1]]
                }
            ));
    }
}