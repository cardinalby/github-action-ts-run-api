import {filterObjectKeys, mapObjectKeys} from "../utils/collections";
import {StringKeyValueObj} from "../types/StringKeyValueObj";
import {AbstractStore} from "../utils/AbstractStore";
import {EnvInterface} from "../types/EnvInterface";

export class InputsStore extends AbstractStore<StringKeyValueObj>
{
    toEnvVariables(): EnvInterface {
        // set env variables for all inputs including empty ones to correspond GitHub Runners behaviour:
        // https://github.com/actions/runner/issues/924
        return mapObjectKeys(this._data,
            name => 'INPUT_' + name.toUpperCase()
        );
    }

    // Custom implementation of apply for inputs is needed because empty string inputs should be handled as
    // missing ones and default inputs should be applied
    apply(changes: Partial<StringKeyValueObj>): this {
        return super.apply(
            filterObjectKeys(changes, (key, value) => value != undefined && value != "")
        );
    }
}