import {RunOptions} from "../../../src/runOptions/RunOptions";
import {ProcessEnvVarsBackup} from "../../utils/ProcessEnvVarsBackup";

describe('RunOptions', () => {
    it('should create from obj and clone', () => {
        const options = RunOptions.create({
            shouldFakeTempDir: {fake: true, cleanUp: false},
            githubContext: {payload: {action: 'f'}},
            githubServiceEnv: {CI: 'false'},
            shouldPrintStdout: true,
            timeoutMs: 123,
            env: {e1: 'v1'},
            inputs: {i1: 'v2'},
            workingDir: '123',
            shouldFakeServiceFiles: true,
            state: {s1: 'v3'},
        });
        const cloned = options.clone();
        expect(options).not.toBe(cloned);
        [options, cloned].forEach(o => {
            expect(o.shouldFakeTempDir).toEqual({fake: true, cleanUp: false});
            expect(o.githubContext.data).toEqual({payload: {action: 'f'}});
            expect(o.githubServiceEnv.data).toEqual({CI: 'false'});
            expect(o.shouldPrintStdout).toEqual(true);
            expect(o.timeoutMs).toEqual(123);
            expect(o.env.data).toEqual({e1: 'v1'});
            expect(o.inputs.data).toEqual({i1: 'v2'});
            expect(o.workingDir).toEqual('123');
            expect(o.shouldFakeServiceFiles).toEqual(true);
            expect(o.state.data).toEqual({s1: 'v3'});
            expect(o.shouldParseStdout).toEqual(true);
        });
        cloned.env.apply({e1: "x1"});
        cloned.inputs.apply({i1: "x2"});
        cloned.state.apply({s1: "x3"});
        cloned.githubContext.apply({payload: {action: 'x4'}});
        cloned.githubServiceEnv.apply({CI: "x5"});
        expect(options.env.data).toEqual({e1: 'v1'});
        expect(options.inputs.data).toEqual({i1: 'v2'});
        expect(options.state.data).toEqual({s1: 'v3'});
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
        expect(options.shouldFakeServiceFiles).toEqual(true);
        expect(options.shouldFakeTempDir).toEqual({fake: true, cleanUp: true});
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
});