export interface ActionInputConfigInterface {
    required: boolean;
    description: string;
    default?: string;
}

export interface ActionInputsConfigInterface {
    [name: string]: ActionInputConfigInterface;
}

export interface ActionConfigInterface {
    inputs?: ActionInputsConfigInterface;
    runs: {
        using: string;
        main: string;
        pre?: string;
        post?: string
    }
    [key: string]: any;
}