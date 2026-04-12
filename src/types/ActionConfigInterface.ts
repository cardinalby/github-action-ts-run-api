export interface ActionInputConfigInterface {
    required: boolean;
    description: string;
    default?: string;
}

export interface ActionInputsConfigInterface {
    [name: string]: ActionInputConfigInterface;
}

export const ActionRunsUsingNode12 = 'node12'
export const ActionRunsUsingNode16 = 'node16'
export const ActionRunsUsingNode20 = 'node20'
export const ActionRunsUsingNode22 = 'node22'
export const ActionRunsUsingNode24 = 'node24'

type ActionRunsUsingNode =
    typeof ActionRunsUsingNode12 |
    typeof ActionRunsUsingNode16 |
    typeof ActionRunsUsingNode20 |
    typeof ActionRunsUsingNode22 |
    typeof ActionRunsUsingNode24

export interface ActionConfigInterface {
    name: string,
    inputs?: ActionInputsConfigInterface;
    runs: {
        using: ActionRunsUsingNode|"composite"|"docker";
        image?: string;
        main?: string;
        pre?: string;
        post?: string;
        args?: string[]
    }
    [key: string]: any;
}