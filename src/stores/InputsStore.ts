import {mapObjectKeys} from "../utils/collections";
import {StringKeyValueObj} from "../types/StringKeyValueObj";
import {AbstractStore} from "./AbstractStore";
import {EnvInterface} from "../types/EnvInterface";

export class InputsStore extends AbstractStore<StringKeyValueObj>
{
    toEnvVariables(): EnvInterface {
        return mapObjectKeys(this._data,
            name => 'INPUT_' + name.toUpperCase()
        );
    }
}