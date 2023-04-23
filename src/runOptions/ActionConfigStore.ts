import {ActionConfigInterface, ActionRunsUsingNode12} from "../types/ActionConfigInterface";
import {Schema, Validator} from "jsonschema";
import {InputsStore} from "./InputsStore";
import {PathLike} from "fs";
import * as yaml from "yaml";
import fs from "fs-extra";
import structuredClone from "realistic-structured-clone";
import assert from "assert";
import {DeprecatedNodeVersionWarning} from "../runResult/warnings/DeprecatedNodeVersionWarning";
import {RunnerWarning} from "../runResult/warnings/RunnerWarning";

const actionConfigSchema = require("../../declarations/github-action-config-schema.json");

/**
 * You can specify an action config by setting an ActionConfigInterface config object or
 * by passing a string pointing to config file path.
 */
export type ActionConfigSource = ActionConfigInterface | string;

export type ActionConfigStoreFilled = ActionConfigStore<ActionConfigInterface>
export type ActionConfigStoreOptional = ActionConfigStore<ActionConfigInterface|undefined>
export type ActionConfigStoreEmpty = ActionConfigStore<undefined>

export class ActionConfigStore<D extends ActionConfigInterface|undefined> {
    protected constructor(
        protected _data: D
    ) {}

    static create(configSource: ActionConfigSource|undefined, required: true): ActionConfigStoreFilled;
    static create(configSource: ActionConfigSource|undefined, required: false): ActionConfigStoreOptional;
    static create(configSource: ActionConfigSource|undefined, required: boolean): ActionConfigStoreOptional
    {
        if (required) {
            assert(configSource !== undefined,
                'Action config should be set using path to action.yml file or config object');
        } else if (configSource === undefined) {
            return ActionConfigStore.empty();
        }
        return typeof configSource === 'string'
            ? ActionConfigStore.fromFile(configSource)
            : ActionConfigStore.fromObject(configSource);
    }

    static fromFile(filePath: PathLike): ActionConfigStoreFilled {
        let config: ActionConfigInterface;
        try {
            config = yaml.parse((fs.readFileSync(filePath)).toString())
        } catch (err) {
            throw new Error("Can't read and parse action.yml. " + err);
        }
        return ActionConfigStore.fromObject(config);
    }

    static fromObject(config: any|ActionConfigInterface): ActionConfigStoreFilled {
        const validator = new Validator();
        const result = validator.validate(config, actionConfigSchema as Schema);
        if (!result.valid) {
            const errors = result.errors.map(error => error.stack).join("\n");
            throw new Error('Error validating action config. ' + errors);
        }
        return new ActionConfigStore(config);
    }

    static empty(): ActionConfigStoreEmpty {
        return new ActionConfigStore(undefined);
    }

    isEmpty(): boolean {
        return this._data === undefined;
    }

    clone(): ActionConfigStore<D> {
        return new ActionConfigStore(structuredClone(this._data));
    }

    get data(): D {
        return this._data;
    }

    getDefaultInputs(): InputsStore {
        if (this._data && this._data.inputs) {
            return new InputsStore(Object.fromEntries(
                // return empty string for inputs without default value to correspond GitHub Runners behaviour:
                // https://github.com/actions/runner/issues/924
                Object.entries(this._data.inputs)
                    .map(entry => entry[1].default !== undefined
                        ? [entry[0], entry[1].default as string]
                        : [entry[0], ""]
                    )
            ));
        }
        return new InputsStore();
    }

    getWarnings(): RunnerWarning[] {
        const warnings: RunnerWarning[] = []
        if (this._data && this._data.runs.using === ActionRunsUsingNode12) {
            warnings.push(new DeprecatedNodeVersionWarning(
                'Node.js 12 actions are deprecated. For more information see: ' +
                'https://github.blog/changelog/2022-09-22-github-actions-all-actions-will-begin-running-on-node16-instead-of-node12/.',
                '12'
            ));
        }
        return warnings;
    }
}