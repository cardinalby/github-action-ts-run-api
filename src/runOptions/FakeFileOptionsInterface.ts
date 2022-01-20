/**
 * @description Normally, you shouldn't set it to false. If you run tests in
 * GitHub Actions environment, calling setShouldFakeServiceFiles(true) and addProcessEnv() together
 * will lead to using original GitHub service files and bloating them by your test data which also
 * potentially has security risks. If you do so, make sure you unset GITHUB_ENV and GITHUB_PATH env variables
 * @param doFake
 * @see {addProcessEnv}
 */
export interface FakeFileOptionsInterface {
    /** @default {true} */
    unsetCommandFilesEnvs: boolean;
    /** @default {true} */
    fakeCommandFiles: boolean;
    /** @default {true} */
    fakeTempDir: boolean;
    /** @default {true} */
    cleanUpTempDir: boolean;
}