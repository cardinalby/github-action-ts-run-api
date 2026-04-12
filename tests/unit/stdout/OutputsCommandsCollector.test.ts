// noinspection ES6PreferShortImport

import {OutputsCommandsCollector} from "../../../src/stdout/OutputsCommandsCollector";
import {StdoutCommandName} from "../../../src/stdout/stdoutCommands";
import {DeprecatedStdoutCommandWarning} from "../../../src/runResult/warnings/DeprecatedStdoutCommandWarning";

/**
 * Writes lines to stdout and/or stderr parsing streams of a collector and
 * waits until both streams are fully closed.
 */
async function feedAndClose(
    collector: OutputsCommandsCollector,
    stdoutLines: string[] = [],
    stderrLines: string[] = []
): Promise<void> {
    if (collector.stdoutParsingStream) {
        for (const line of stdoutLines) {
            collector.stdoutParsingStream.write(line);
        }
        collector.stdoutParsingStream.end();
    }
    if (collector.stderrParsingStream) {
        for (const line of stderrLines) {
            collector.stderrParsingStream.write(line);
        }
        collector.stderrParsingStream.end();
    }
    await collector.waitUntilStreamsAreClosed();
}

describe('OutputsCommandsCollector', () => {
    describe('stream creation', () => {
        it('should create stdout stream when parseStdout is true', () => {
            const collector = new OutputsCommandsCollector(true, false);
            expect(collector.stdoutParsingStream).toBeDefined();
            expect(collector.stderrParsingStream).toBeUndefined();
            collector.stdoutParsingStream!.destroy();
        });

        it('should create stderr stream when parseStderr is true', () => {
            const collector = new OutputsCommandsCollector(false, true);
            expect(collector.stdoutParsingStream).toBeUndefined();
            expect(collector.stderrParsingStream).toBeDefined();
            collector.stderrParsingStream!.destroy();
        });

        it('should create both streams when both flags are true', () => {
            const collector = new OutputsCommandsCollector(true, true);
            expect(collector.stdoutParsingStream).toBeDefined();
            expect(collector.stderrParsingStream).toBeDefined();
            collector.stdoutParsingStream!.destroy();
            collector.stderrParsingStream!.destroy();
        });

        it('should create no streams when both flags are false', () => {
            const collector = new OutputsCommandsCollector(false, false);
            expect(collector.stdoutParsingStream).toBeUndefined();
            expect(collector.stderrParsingStream).toBeUndefined();
        });
    });

    describe('command collection', () => {
        it('should collect commands from stdout', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, [
                '::warning::warn1\n',
                '::error::err1\n',
            ]);
            expect(collector.commandsStore.data.warnings).toEqual(['warn1']);
            expect(collector.commandsStore.data.errors).toEqual(['err1']);
        });

        it('should collect commands from stderr', async () => {
            const collector = new OutputsCommandsCollector(false, true);
            await feedAndClose(collector, [], [
                '::debug::dbg1\n',
            ]);
            expect(collector.commandsStore.data.debugs).toEqual(['dbg1']);
        });

        it('should merge commands from both stdout and stderr into one store', async () => {
            const collector = new OutputsCommandsCollector(true, true);
            await feedAndClose(
                collector,
                ['::warning::from-stdout\n'],
                ['::warning::from-stderr\n']
            );
            expect(collector.commandsStore.data.warnings).toEqual([
                'from-stdout',
                'from-stderr',
            ]);
        });

        it('should collect set-output commands into outputs', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, [
                '::set-output name=key1::val1\n',
                '::set-output name=key2::val2\n',
            ]);
            expect(collector.commandsStore.data.outputs).toEqual({
                key1: 'val1',
                key2: 'val2',
            });
        });

        it('should collect save-state commands', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, ['::save-state name=my_state::stateVal\n']);
            expect(collector.commandsStore.data.savedState).toEqual({my_state: 'stateVal'});
        });

        it('should ignore non-command lines', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, [
                'plain output\n',
                '::debug::actual cmd\n',
            ]);
            expect(collector.commandsStore.data.debugs).toEqual(['actual cmd']);
        });
    });

    describe('deprecation warnings', () => {
        it('should warn once for set-output command', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, [
                '::set-output name=k1::v1\n',
                '::set-output name=k2::v2\n', // second occurrence — no extra warning
            ]);
            const warnings = collector.commandWarnings;
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toBeInstanceOf(DeprecatedStdoutCommandWarning);
            expect(warnings[0].command).toBe(StdoutCommandName.SET_OUTPUT);
        });

        it('should warn once for save-state command', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, ['::save-state name=s::v\n']);
            const warnings = collector.commandWarnings;
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toBeInstanceOf(DeprecatedStdoutCommandWarning);
            expect(warnings[0].command).toBe(StdoutCommandName.SAVE_STATE);
        });

        it('should warn once for add-path command', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, ['::add-path::my/path\n']);
            const warnings = collector.commandWarnings;
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toBeInstanceOf(DeprecatedStdoutCommandWarning);
            expect(warnings[0].command).toBe(StdoutCommandName.ADD_PATH);
        });

        it('should warn once for set-env command', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, ['::set-env name=VAR::value\n']);
            const warnings = collector.commandWarnings;
            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toBeInstanceOf(DeprecatedStdoutCommandWarning);
            expect(warnings[0].command).toBe(StdoutCommandName.SET_ENV);
        });

        it('should produce separate warnings for each distinct deprecated command', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, [
                '::set-output name=k::v\n',
                '::save-state name=s::v\n',
                '::add-path::p\n',
                '::set-env name=E::v\n',
            ]);
            const warnings = collector.commandWarnings;
            expect(warnings).toHaveLength(4);
            const commands = warnings.map(w => w.command);
            expect(commands).toContain(StdoutCommandName.SET_OUTPUT);
            expect(commands).toContain(StdoutCommandName.SAVE_STATE);
            expect(commands).toContain(StdoutCommandName.ADD_PATH);
            expect(commands).toContain(StdoutCommandName.SET_ENV);
        });

        it('should not warn for non-deprecated commands', async () => {
            const collector = new OutputsCommandsCollector(true, false);
            await feedAndClose(collector, [
                '::warning::w\n',
                '::error::e\n',
                '::debug::d\n',
                '::notice::n\n',
                '::echo::on\n',
                '::add-mask::secret\n',
            ]);
            expect(collector.commandWarnings).toHaveLength(0);
        });

        it('should deduplicate warnings even when command comes from both stdout and stderr', async () => {
            const collector = new OutputsCommandsCollector(true, true);
            await feedAndClose(
                collector,
                ['::set-output name=k1::v1\n'],
                ['::set-output name=k2::v2\n']
            );
            // Both streams use the same commandsWarnings map so only one warning
            expect(collector.commandWarnings).toHaveLength(1);
        });
    });

    describe('waitUntilStreamsAreClosed', () => {
        it('should resolve immediately when no streams are created', async () => {
            const collector = new OutputsCommandsCollector(false, false);
            await expect(collector.waitUntilStreamsAreClosed()).resolves.toBeUndefined();
        });

        it('should resolve after both streams are ended', async () => {
            const collector = new OutputsCommandsCollector(true, true);
            await feedAndClose(collector, ['::debug::d\n'], ['::debug::d\n']);
            await expect(collector.waitUntilStreamsAreClosed()).resolves.toBeUndefined();
        });
    });
});
