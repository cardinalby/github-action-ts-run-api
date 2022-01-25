import {ActionConfigInterface} from "../../../types/ActionConfigInterface";

export class InputContainerArg {
    constructor(public inputName: string) {}
}

export function getContainerArgs(actionConfig: ActionConfigInterface): (InputContainerArg|string)[] {
    const args = actionConfig.runs.args;
    if (args === undefined) {
        return [];
    }
    return args.map((arg: string) => {
        const ghExpression = /^\${{\s+(.*?)\s+}}$/.exec(arg.trim());
        if (ghExpression) {
            const actionInput = /^inputs\.(.+?)$/.exec(ghExpression[1]);
            if (!actionInput) {
                throw new Error('Unsupported github expression: ' + arg);
            }
            if (!actionConfig.inputs ||
                actionConfig.inputs[actionInput[1]] === undefined
            ) {
                throw new Error(`Input ${actionInput[1]} from runs.args is not ` +
                                `listed in inputs section of action.yml file`
                )
            }
            return new InputContainerArg(actionInput[1]);
        }
        return arg;
    });
}