// noinspection ES6PreferShortImport

import {RunOptions} from "../../../src/runOptions/RunOptions";
import {FakeFsOptionsInterface} from "../../../src/runOptions/FakeFsOptionsInterface";
import {OutputOptionsInterface} from "../../../src/runOptions/OutputOptionsInterface";
import {StdoutTransform} from "../../../src/runOptions/StdoutTransform";

describe('RunOptions', () => {
    it('should create from obj and clone', () => {
        const options = RunOptions.create({
            fakeFsOptions: {
                fakeCommandFiles: false,
                rmFakedTempDirAfterRun: false,
                rmFakedWorkspaceDirAfterRun: false
            },
            githubContext: {payload: {action: 'f'}},
            githubServiceEnv: {CI: 'false'},
            shouldAddProcessEnv: false,
            shouldFakeMinimalGithubRunnerEnv: true,
            outputOptions: {
                parseStdoutCommands: false
            },
            timeoutMs: 123,
            env: {e1: 'v1'},
            inputs: {i1: 'v2'},
            workingDir: '123',
            state: {s1: 'v3'},
        });
        const cloned = options.clone();
        expect(options).not.toBe(cloned);
        for (let o of [options, cloned]) {
            expect(o.fakeFsOptions.data).toEqual({
                fakeCommandFiles: false,
                rmFakedTempDirAfterRun: false,
                rmFakedWorkspaceDirAfterRun: false
            } as FakeFsOptionsInterface);
            expect(o.githubContext.data).toEqual({payload: {action: 'f'}});
            expect(o.githubServiceEnv.data).toEqual({CI: 'false'});
            expect(o.shouldAddProcessEnv).toEqual(false);
            expect(o.shouldFakeMinimalGithubRunnerEnv).toEqual(true);
            expect(o.outputOptions.data).toEqual({
                parseStdoutCommands: false,
                printStdout: true,
                stdoutTransform: undefined,
                printStderr: true,
                printRunnerDebug: false
            } as OutputOptionsInterface);
            expect(o.timeoutMs).toEqual(123);
            expect(o.env.data).toEqual({e1: 'v1'});
            expect(o.inputs.data).toEqual({i1: 'v2'});
            expect(o.workingDir).toEqual('123');
            expect(o.state.data).toEqual({s1: 'v3'});
        }

        cloned.setEnv({e1: "x1"});
        cloned.setInputs({i2: "x2"});
        cloned.setState({s1: "x3"});
        cloned.setGithubContext({payload: {action: 'x4'}});
        cloned.setGithubServiceEnv({GITHUB_HEAD_REF: "x5"});
        cloned.setShouldAddProcessEnv(true);
        cloned.setFakeFsOptions({rmFakedTempDirAfterRun: true});
        cloned.setOutputOptions({
            printStderr: true,
            printStdout: false,
            stdoutTransform: StdoutTransform.SANITIZE_COMMANDS,
            parseStdoutCommands: true,
            printRunnerDebug: false
        }, false);

        expect(cloned.fakeFsOptions.data).toEqual({
            fakeCommandFiles: false,
            rmFakedTempDirAfterRun: true,
            rmFakedWorkspaceDirAfterRun: false
        } as FakeFsOptionsInterface);
        expect(cloned.env.data).toEqual({e1: "x1"});
        expect(cloned.inputs.data).toEqual({i1: "v2", i2: 'x2'});
        expect(cloned.state.data).toEqual({s1: "x3"});
        expect(cloned.githubContext.data).toEqual({payload: {action: 'x4'}});
        expect(cloned.githubServiceEnv.data).toEqual({CI: 'false', GITHUB_HEAD_REF: "x5"});
        expect(cloned.shouldAddProcessEnv).toEqual(true);
        expect(cloned.outputOptions.data).toEqual({
            printStderr: true,
            printStdout: false,
            stdoutTransform: StdoutTransform.SANITIZE_COMMANDS,
            parseStdoutCommands: true,
            printRunnerDebug: false
        });

        expect(options.shouldAddProcessEnv).toEqual(false);
        expect(options.env.data).toEqual({e1: 'v1'});
        expect(options.inputs.data).toEqual({i1: 'v2'});
        expect(options.state.data).toEqual({s1: 'v3'});
        expect(options.outputOptions.data).toEqual({
            parseStdoutCommands: false,
            printStdout: true,
            stdoutTransform: undefined,
            printStderr: true,
            printRunnerDebug: false
        } as OutputOptionsInterface);
        expect(options.fakeFsOptions.data).toEqual({
            fakeCommandFiles: false,
            rmFakedTempDirAfterRun: false,
            rmFakedWorkspaceDirAfterRun: false
        } as FakeFsOptionsInterface);
        expect(options.githubContext.data).toEqual({payload: {action: 'f'}});
        expect(options.githubServiceEnv.data).toEqual({CI: 'false'});
    });

    it('should set defaults', () => {
        const options = RunOptions.create();

        expect(options.outputOptions.data).toEqual({
            printStderr: true,
            printStdout: true,
            stdoutTransform: undefined,
            parseStdoutCommands: true,
            printRunnerDebug: false
        } as OutputOptionsInterface);
        expect(options.timeoutMs).toEqual(undefined);
        expect(options.env.data).toEqual({});
        expect(options.inputs.data).toEqual({});
        expect(options.state.data).toEqual({});
        expect(options.githubContext.data).toEqual({});
        expect(options.githubServiceEnv.data).toEqual({});
        expect(options.shouldFakeMinimalGithubRunnerEnv).toEqual(true);
        expect(options.workingDir).toEqual(undefined);
        expect(options.fakeFsOptions.data).toEqual({
            fakeCommandFiles: true,
            rmFakedTempDirAfterRun: true,
            rmFakedWorkspaceDirAfterRun: true
        } as FakeFsOptionsInterface);
        expect(options.outputOptions.data.parseStdoutCommands).toEqual(true);
    });

    it('should set fakeFsOptions', () => {
        const options = RunOptions.create();
        options.setFakeFsOptions({
            fakeCommandFiles: false,
            rmFakedTempDirAfterRun: false,
            rmFakedWorkspaceDirAfterRun: false,
            tmpRootDir: 'ad'
        }, false)
        expect(options.fakeFsOptions.data).toEqual({
            fakeCommandFiles: false,
            rmFakedTempDirAfterRun: false,
            rmFakedWorkspaceDirAfterRun: false,
            tmpRootDir: 'ad'
        } as FakeFsOptionsInterface)
        options.setFakeFsOptions({
            fakeCommandFiles: true,
            rmFakedTempDirAfterRun: true,
        });
        expect(options.fakeFsOptions.data).toEqual({
            fakeCommandFiles: true,
            rmFakedTempDirAfterRun: true,
            rmFakedWorkspaceDirAfterRun: false,
            tmpRootDir: 'ad'
        } as FakeFsOptionsInterface)
    });
});