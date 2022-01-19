export enum GithubServiceFileName {
    ENV = 'ENV',
    PATH = 'PATH',
    EVENT_PATH = 'EVENT_PATH'
}

export function getKnownFileCommandNames(): GithubServiceFileName[] {
    return [GithubServiceFileName.ENV, GithubServiceFileName.PATH];
}