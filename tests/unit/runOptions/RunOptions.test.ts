import {RunOptions} from "../../../src/runOptions/RunOptions";
import {ProcessEnvVarsBackup} from "../../utils/ProcessEnvVarsBackup";

describe('RunOptions', () => {
    it('should create from obj and clone', () => {
        const options = RunOptions.create({
            fakeFileOptions: {
                fakeCommandFiles: false,
                unsetCommandFilesEnvs: false,
                fakeTempDir: false
            },
            githubContext: {payload: {action: 'f'}},
            githubServiceEnv: {CI: 'false'},
            shouldPrintStdout: true,
            timeoutMs: 123,
            env: {e1: 'v1'},
            inputs: {i1: 'v2'},
            workingDir: '123',
            state: {s1: 'v3'},
        });
        const cloned = options.clone();
        expect(options).not.toBe(cloned);
        for (let o of [options, cloned]) {
            expect(o.fakeFileOptions.data).toEqual({
                fakeCommandFiles: false,
                unsetCommandFilesEnvs: false,
                fakeTempDir: false,
                cleanUpTempDir: true
            });
            expect(o.githubContext.data).toEqual({payload: {action: 'f'}});
            expect(o.githubServiceEnv.data).toEqual({CI: 'false'});
            expect(o.shouldPrintStdout).toEqual(true);
            expect(o.timeoutMs).toEqual(123);
            expect(o.env.data).toEqual({e1: 'v1'});
            expect(o.inputs.data).toEqual({i1: 'v2'});
            expect(o.workingDir).toEqual('123');
            expect(o.state.data).toEqual({s1: 'v3'});
            expect(o.shouldParseStdout).toEqual(true);
        }
        cloned.env.apply({e1: "x1"});
        cloned.inputs.apply({i1: "x2"});
        cloned.state.apply({s1: "x3"});
        cloned.githubContext.apply({payload: {action: 'x4'}});
        cloned.githubServiceEnv.apply({CI: "x5"});
        cloned.fakeFileOptions.apply({fakeTempDir: true});
        expect(cloned.fakeFileOptions.data).toEqual({
            fakeCommandFiles: false,
            unsetCommandFilesEnvs: false,
            fakeTempDir: true,
            cleanUpTempDir: true
        });
        expect(options.env.data).toEqual({e1: 'v1'});
        expect(options.inputs.data).toEqual({i1: 'v2'});
        expect(options.state.data).toEqual({s1: 'v3'});
        expect(options.fakeFileOptions.data).toEqual({
            fakeCommandFiles: false,
            unsetCommandFilesEnvs: false,
            fakeTempDir: false,
            cleanUpTempDir: true
        });
        expect(options.githubContext.data).toEqual({payload: {action: 'f'}});
        expect(options.githubServiceEnv.data).toEqual({CI: 'false'});
    });

    it('should set defaults', () => {
        const options = RunOptions.create();

        expect(options.shouldPrintStdout).toEqual(false);
        expect(options.timeoutMs).toEqual(undefined);
        expect(options.env.data).toEqual({});
        expect(options.inputs.data).toEqual({});
        expect(options.state.data).toEqual({});
        expect(options.githubContext.data).toEqual({});
        expect(options.githubServiceEnv.data).toEqual({});
        expect(options.workingDir).toEqual(undefined);
        expect(options.fakeFileOptions.data).toEqual({
            fakeCommandFiles: true,
            unsetCommandFilesEnvs: true,
            fakeTempDir: true,
            cleanUpTempDir: true
        });
        expect(options.shouldParseStdout).toEqual(true);
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

    it('should set fakeFileOptions', () => {
        const options = RunOptions.create();
        options.setFakeFileOptions({
            fakeCommandFiles: false,
            cleanUpTempDir: false,
            unsetCommandFilesEnvs: false,
            fakeTempDir: false
        }, false)
        expect(options.fakeFileOptions.data).toEqual({
            fakeCommandFiles: false,
            cleanUpTempDir: false,
            unsetCommandFilesEnvs: false,
            fakeTempDir: false
        })
        options.setFakeFileOptions({
            unsetCommandFilesEnvs: true,
            fakeTempDir: true
        });
        expect(options.fakeFileOptions.data).toEqual({
            fakeCommandFiles: false,
            cleanUpTempDir: false,
            unsetCommandFilesEnvs: true,
            fakeTempDir: true
        })
    });
});