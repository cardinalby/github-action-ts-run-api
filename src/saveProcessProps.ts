export type RestoreProcessPropsFn = () => void;

export function saveProcessProps(): RestoreProcessPropsFn {
    const originalEnv = {...process.env};
    return () => {
        process.env = {...originalEnv};
        process.exitCode = 0;
    }
}