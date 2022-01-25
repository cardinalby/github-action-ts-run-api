export interface FakeFsOptionsInterface {
    /**
     * You can specify a temp dir where faked files and dirs will be created
     * @default {undefined} use system temp dir
     */
    tmpRootDir: string|undefined;

    /**
     * @default {true}
     */
    fakeCommandFiles: boolean;

    /**
     * Whether runner should remove a temp dir if it was a fake one (options.tempDir === undefined)
     * @default {true}
     */
    rmFakedTempDirAfterRun: boolean;

    /**
     * Whether runner should remove a workspace dir if it was a fake one (options.workspaceDir === undefined)
     * @default {true}
     */
    rmFakedWorkspaceDirAfterRun: boolean;
}