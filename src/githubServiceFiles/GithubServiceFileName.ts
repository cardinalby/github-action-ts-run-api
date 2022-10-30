export enum GithubServiceFileName {
    ENV = 'ENV',
    PATH = 'PATH',
    STATE = 'STATE',
    OUTPUT = 'OUTPUT',
    EVENT_PATH = 'EVENT_PATH'
}

export function getFileCommandNames(): GithubServiceFileName[] {
    return [
        GithubServiceFileName.ENV,
        GithubServiceFileName.PATH,
        GithubServiceFileName.STATE,
        GithubServiceFileName.OUTPUT
    ];
}