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

export interface ActionConfigInterface {
    name: string,
    inputs?: ActionInputsConfigInterface;
    runs: {
        using: "node12"|"node16"|"node20"|"composite"|"docker";
        image?: string;
        main?: string;
        pre?: string;
        post?: string;
        args?: string[]
    }
    [key: string]: any;
}