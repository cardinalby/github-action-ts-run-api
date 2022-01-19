import {EnvInterface} from "../../src/types/EnvInterface";

export class ProcessEnvVarsBackup {
    private readonly _backup: EnvInterface;

    static safeSet(changes: EnvInterface): ProcessEnvVarsBackup {
        const backup = new ProcessEnvVarsBackup(Object.keys(changes));
        ProcessEnvVarsBackup.applyToProcessEnv(changes);
        return backup;
    }

    constructor(
        private _varNames: string[])
    {
        this._backup = Object.fromEntries(
            _varNames.map(name => [name, process.env[name]])
        );
    }

    restore() {
        ProcessEnvVarsBackup.applyToProcessEnv(this._backup);
    }

    private static applyToProcessEnv(changes: EnvInterface) {
        for (let [name, value] of Object.entries(changes)) {
            if (value !== undefined) {
                process.env[name] = value;
            } else {
                delete process.env[name];
            }
        }
    }
}