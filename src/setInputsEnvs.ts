export type ActionInputsObject = {
    [key: string]: string|undefined
}

export function setInputEnv(name: string, value: string) {
    process.env['INPUT_' + name.toUpperCase()] = value;
}

export function setInputsEnv<T extends ActionInputsObject>(
    inputs: T,
    actionConfig?: {[key: string]: any}
) {
    if (actionConfig &&
        typeof actionConfig === 'object' &&
        typeof actionConfig.inputs === 'object'
    ) {
        Object.keys(actionConfig.inputs).forEach(inputName => {
            const input = actionConfig.inputs[inputName];
            if (!input.required &&
                input.default !== undefined &&
                !inputs.hasOwnProperty(inputName)
            ) {
                setInputEnv(inputName, String(input.default));
            }
        })
    }

    Object.keys(inputs).forEach(
        inputName => {
            const inputValue = inputs[inputName];
            if (inputValue !== undefined) {
                setInputEnv(inputName, inputValue);
            }
        }
    );
}