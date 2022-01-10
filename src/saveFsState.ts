import {FileStateRecoveryPointFactoryFn} from "./FileStateRecoveryPoint";

export type RestoreFsStateFn = () => void;

export function saveFileCommandsState(
    commands: string[], // ['PATH', 'ENV']
    createRecoveryState: FileStateRecoveryPointFactoryFn
): RestoreFsStateFn {
    const fileCommandPaths = commands
        .map(name => process.env['GITHUB_' + name])
        .filter(name => name !== undefined && name.length > 0) as string[];

    const recoveryPoints = fileCommandPaths.map(createRecoveryState)

    return () => {
        recoveryPoints.forEach(point => point.restore());
    }
}


