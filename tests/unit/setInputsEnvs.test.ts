import * as core from "@actions/core";
import {setInputsEnv} from "../../src";
import {RestoreProcessPropsFn, saveProcessProps} from "../../src";

describe('setInputsEnv', () => {

    let restoreProcessProps: RestoreProcessPropsFn;
    beforeEach(() => {
        restoreProcessProps = saveProcessProps()
    })

    afterEach(() => {
        restoreProcessProps();
    })

    it('should set inputs without action config', () => {
        setInputsEnv({input1: 'val1', input2: 'true'});
        expect(core.getInput('input1')).toEqual('val1');
        expect(core.getBooleanInput('input2')).toEqual(true);
    });

    it('should set inputs with action config', () => {
        const actionConfig = {
            name: 'name',
            inputs: {
                input1: {
                    required: false,
                    default: 'default1'
                },
                input2: {
                    required: true
                },
                input3: {
                    required: false,
                    default: 'default3'
                },
                input4: {
                    required: false
                }
            }
        }
        setInputsEnv({input1: 'val1', input2: 'true'}, actionConfig);

        expect(core.getInput('INPUT1')).toEqual('val1');
        expect(core.getBooleanInput('input2')).toEqual(true);
        expect(core.getInput('input3')).toEqual('default3');
        expect(core.getInput('input4')).toEqual('');
    })
});