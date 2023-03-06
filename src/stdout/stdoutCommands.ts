export enum StdoutCommandName {
    // noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
    ERROR = 'error',
    WARNING = 'warning',
    NOTICE = 'notice',
    DEBUG = 'debug',
    GROUP = 'group',
    END_GROUP = 'endgroup',
    SAVE_STATE = 'save-state',
    ADD_MASK = 'add-mask',
    ADD_PATH = 'add-path',
    ECHO = 'echo',
    SET_ENV = 'set-env',
    SET_OUTPUT = 'set-output'
}

export interface StdoutCommandInterface {
    command: StdoutCommandName | string,
    properties: { [key: string]: string },
    message: string | undefined
}

export const stdoutCmdWithParamRegexp = /^::([A-Za-z\d\-_.]+?)(\s.+)?::(.*)?$/m;
export const stdoutCmdRegexp = /^::([A-Za-z\d\-_.]+?)(\s.+)?::/m