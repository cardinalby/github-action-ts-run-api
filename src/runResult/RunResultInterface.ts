import {ParsedCommandsInterface} from "./ParsedCommandsInterface";

/**
 * Read more in docs/run-result.md
 */
export interface RunResultInterface {
    readonly exitCode: number|undefined;
    readonly commands: ParsedCommandsInterface;
    readonly stdout: string|undefined;
    readonly stderr: string|undefined;
    readonly error: Error|undefined;
    readonly durationMs: number;
    readonly isTimedOut: boolean;
    readonly isSuccess: boolean;

    /**
     * @description
     * Path of a temp directory (accessible under `RUNNER_TEMP` inside tested action) that is still available
     * after the action run. By default, it's `undefined` because faked dirs are deleted after run.
     * For Docker target it contains a path of the host directory.
     *
     * Can have value in case of:
     * 1. You asked not to delete faked temp dir after run: <br>
     *    `options.setFakeFsOptions({ rmFakedTempDirAfterRun: false })`.<br>
     *    You are supposed to call `result.cleanUpFakedDirs()` at the end of a test by yourself.
     * 2. You set existing directory as action temp dir: `options.setTempDir('existing/path')`.
     */
    readonly tempDirPath: string|undefined;

    /**
     * Path of a workspace directory (accessible under `GITHUB_WORKSPACE` inside tested action) that is still available
     * after the action run. By default, it's `undefined` because faked dirs are deleted after run.
     * For Docker target it contains a path of the host directory.
     *
     * Can have value in case of:
     * 1. You asked not to delete faked workspace dir after run:<br>
     *    `options.setFakeFsOptions({ rmFakedWorkspaceDirAfterRun: false })`.<br>
     *    You are supposed to call `result.cleanUpFakedDirs()` at the end of a test by yourself.
     * 2. You set existing directory as action temp dir: `options.setWorkspaceDir('existing/path')`.
     */
    readonly workspaceDirPath: string|undefined;

    /**
     * @description
     * Delete faked directories that still exist after run. It will not delete existing dirs set explicitly by
     * `options.setWorkspaceDir(...)` and `options.setTempDir(...)` functions.
     *
     * You have to call it only if you used `rmFakedTempDirAfterRun: false` or `rmFakedWorkspaceDirAfterRun: false` options
     * for fake FS options.
     *
     * Alternatively, you can set up calling global `deleteAllFakedDirs()` method after each test case in your
     * test framework.
     *
     * Example with Jest:
     *
     * import {deleteAllFakedDirs} from 'github-action-ts-run-api';
     * afterEach(deleteAllFakedDirs);
     */
    cleanUpFakedDirs(): this;
}