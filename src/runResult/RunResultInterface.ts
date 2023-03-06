import {ParsedCommandsInterface} from "./ParsedCommandsInterface";
import {RunnerWarning} from "./warnings/RunnerWarning";

/**
 * Read more in docs/run-result.md
 */
export interface RunResultInterface {
    /**
     * @description
     * Exit code
     * - of a child process (for JS file and Docker targets)
     * - code set to `process.exitCode` (for a single function target).
     */
    readonly exitCode: number|undefined;

    /**
     * @description
     * Collection of workflow commands parsed from stdout and command files
     * @see https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
     */
    readonly commands: ParsedCommandsInterface;

    /**
     * @description
     * Data intercepted from stdout of a tested action.
     */
    readonly stdout: string|undefined;

    /**
     * @description
     * Data intercepted from stderr of a tested action.
     */
    readonly stderr: string|undefined;

    /**
     * @description
     * - Error from `spawnSync` result (for JS file and Docker targets)
     * - Error thrown in `syncFn` and `asyncFn` targets or returned Promise rejected reason for `asyncFn` target.
     */
    readonly error: Error|undefined;

    /**
     * @description
     * Duration of target execution in milliseconds (`number`).
     * For `asyncFn` target counts as time passed from the moment
     * of calling a function to the moment when Promise fulfills.
     */
    readonly durationMs: number;

    /**
     * @description
     * - `true` if a target execution took more time than timeout specified in `timeoutMs` property of options;
     * - `false` otherwise.
     */
    readonly isTimedOut: boolean;

    /**
     * `true` if exitCode is 0 (or not set in function) and error is `undefined`; `false` otherwise.
     */
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
     * Array of structured Warnings, similar messages produced by GitHub Runner
     * By default these warnings are printed to stderr at the end of the run.
     * If you want to check them by yourself, you can disable this behavior by
     * `options.setOutputOptions({printRunnerWarnings: false})`
     **/
    readonly runnerWarnings: RunnerWarning[];
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