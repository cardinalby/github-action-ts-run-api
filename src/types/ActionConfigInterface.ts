export interface ActionInputConfigInterface {
    required: boolean;
    description: string;
    default?: string;
}

export interface ActionInputsConfigInterface {
    [name: string]: ActionInputConfigInterface;
}

export interface ActionConfigInterface {
    name: string,
    inputs?: ActionInputsConfigInterface;
    runs: {
        using: "node12"|"node16"|"composite"|"docker";
        image?: string;
        main?: string;
        pre?: string;
        post?: string;
        args?: string[]
    }
    [key: string]: any;
}