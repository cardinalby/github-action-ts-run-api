import {RunnerArch, RunnerOs} from "../types/GithubServiceEnvInterface";

export function getRunnerOs(): RunnerOs | undefined {
    switch (process.platform) {
        case 'darwin':
            return 'macOS';
        case 'win32':
            return 'Windows';
        case 'linux':
        case 'cygwin':
            return 'Linux';
        default:
            return undefined;
    }
}

export function getRunnerArch(): RunnerArch | undefined {
    switch (process.arch) {
        case 'arm':
            return 'ARM';
        case 'arm64':
            return 'ARM64';
        case 'x32':
            return 'X86';
        case 'x64':
            return 'X64';
        default:
            return undefined;
    }
}