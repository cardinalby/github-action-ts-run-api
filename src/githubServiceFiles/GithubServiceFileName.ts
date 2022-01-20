export enum GithubServiceFileName {
    ENV = 'ENV',
    PATH = 'PATH',
    EVENT_PATH = 'EVENT_PATH'
}

export function getFileCommandNames(): GithubServiceFileName[] {
    return [GithubServiceFileName.ENV, GithubServiceFileName.PATH];
}