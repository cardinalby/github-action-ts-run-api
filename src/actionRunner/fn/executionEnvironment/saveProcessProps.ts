export type RestoreProcessPropsFn = () => void;

export function saveProcessProps(): RestoreProcessPropsFn {
    const originalCwd = process.cwd();
    const originalEnv = {...process.env};
    const originalExitCode = process.exitCode;

    return () => {
        process.env = {...originalEnv};
        process.exitCode = originalExitCode;
        process.chdir(originalCwd);
    };
}