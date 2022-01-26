// noinspection ES6PreferShortImport

import {RunOptions} from "../../../src/runOptions/RunOptions";
import {ProcessEnvVarsBackup} from "../../utils/ProcessEnvVarsBackup";
import {FakeFsOptionsInterface} from "../../../src/runOptions/FakeFsOptionsInterface";
import {OutputOptionsInterface} from "../../../src/runOptions/OutputOptionsInterface";

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
            expect(o.shouldFakeMinimalGithubRunnerEnv).toEqual(true);
            expect(o.outputOptions.data).toEqual({
                parseStdoutCommands: false,
                printStdout: undefined,
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
        cloned.setInputs({i1: "x2"});
        cloned.setState({s1: "x3"});
        cloned.setGithubContext({payload: {action: 'x4'}});
        cloned.setGithubServiceEnv({CI: "x5"});
        cloned.setFakeFsOptions({rmFakedTempDirAfterRun: true});
        cloned.setOutputOptions({
            printStderr: true,
            printStdout: false,
            parseStdoutCommands: true,
            printRunnerDebug: false
        }, false);
        expect(cloned.fakeFsOptions.data).toEqual({
            fakeCommandFiles: false,
            rmFakedTempDirAfterRun: true,
            rmFakedWorkspaceDirAfterRun: false
        } as FakeFsOptionsInterface);
        expect(options.env.data).toEqual({e1: 'v1'});
        expect(options.inputs.data).toEqual({i1: 'v2'});
        expect(options.state.data).toEqual({s1: 'v3'});
        expect(options.outputOptions.data).toEqual({
            parseStdoutCommands: false,
            printStdout: undefined,
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
            printStdout: undefined,
            parseStdoutCommands: true,
            printRunnerDebug: false
        } as OutputOptionsInterface);
        expect(options.timeoutMs).toEqual(undefined);
        expect(options.env.data).toEqual({});
        expect(options.inputs.data).toEqual({});
        expect(options.state.data).toEqual({});
        expect(options.githubContext.data).toEqual({});
        expect(options.githubServiceEnv.data).toEqual({});
        expect(options.shouldFakeMinimalGithubRunnerEnv).toEqual(false);
        expect(options.workingDir).toEqual(undefined);
        expect(options.fakeFsOptions.data).toEqual({
            fakeCommandFiles: true,
            rmFakedTempDirAfterRun: true,
            rmFakedWorkspaceDirAfterRun: true
        } as FakeFsOptionsInterface);
        expect(options.outputOptions.data.parseStdoutCommands).toEqual(true);
    });

    it('should modify env', () => {
        const options = RunOptions.create();
        const backup = ProcessEnvVarsBackup.safeSet({AAA: 'bbb', CCC: 'ddd'});
        try {
            options.setEnv({XXX: 'yyy'})
            options.addProcessEnv();
            expect(options.env.data.XXX).toEqual('yyy');
            expect(options.env.data.AAA).toEqual('bbb');
            expect(options.env.data.CCC).toEqual('ddd');
            options.setEnv({CCC: undefined});
            expect(options.env.data.AAA).toEqual('bbb');
            expect(options.env.data.CCC).toEqual(undefined);
        }
        finally {
            backup.restore();
        }
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