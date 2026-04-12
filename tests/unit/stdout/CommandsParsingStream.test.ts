// noinspection ES6PreferShortImport

import {Readable} from "stream";
import {CommandsParsingStream} from "../../../src/stdout/CommandsParsingStream";
import {StdoutCommandInterface, StdoutCommandName} from "../../../src/stdout/stdoutCommands";

/**
 * Writes chunks into the stream and collects all emitted command objects.
 */
async function collectCommands(
    chunks: string[],
    stream: CommandsParsingStream = new CommandsParsingStream()
): Promise<StdoutCommandInterface[]> {
    const commands: StdoutCommandInterface[] = [];
    stream.on('data', (cmd: StdoutCommandInterface) => commands.push(cmd));

    for (const chunk of chunks) {
        stream.write(chunk);
    }
    stream.end();

    await stream.waitUntilClosed();
    return commands;
}

describe('CommandsParsingStream', () => {
    describe('command parsing', () => {
        it('should parse a single complete command line', async () => {
            const cmds = await collectCommands(['::warning::hello\n']);
            expect(cmds).toHaveLength(1);
            expect(cmds[0].command).toBe(StdoutCommandName.WARNING);
            expect(cmds[0].message).toBe('hello');
            expect(cmds[0].properties).toEqual({});
        });

        it('should parse multiple commands in separate chunks each ending with newline', async () => {
            const cmds = await collectCommands([
                '::error::err1\n',
                '::debug::dbg1\n',
            ]);
            expect(cmds).toHaveLength(2);
            expect(cmds[0].command).toBe(StdoutCommandName.ERROR);
            expect(cmds[0].message).toBe('err1');
            expect(cmds[1].command).toBe(StdoutCommandName.DEBUG);
            expect(cmds[1].message).toBe('dbg1');
        });

        it('should parse multiple commands in a single chunk', async () => {
            const cmds = await collectCommands([
                '::error::err1\n::debug::dbg1\n',
            ]);
            expect(cmds).toHaveLength(2);
            expect(cmds[0].command).toBe(StdoutCommandName.ERROR);
            expect(cmds[1].command).toBe(StdoutCommandName.DEBUG);
        });

        it('should reassemble a command split across two chunks', async () => {
            const cmds = await collectCommands([
                '::set-output na',
                'me=myKey::myVal\n',
            ]);
            expect(cmds).toHaveLength(1);
            expect(cmds[0].command).toBe(StdoutCommandName.SET_OUTPUT);
            expect(cmds[0].properties).toEqual({name: 'myKey'});
            expect(cmds[0].message).toBe('myVal');
        });

        it('should parse command properties', async () => {
            const cmds = await collectCommands([
                '::set-env name=MY_VAR::my_value\n',
            ]);
            expect(cmds).toHaveLength(1);
            expect(cmds[0].command).toBe(StdoutCommandName.SET_ENV);
            expect(cmds[0].properties).toEqual({name: 'MY_VAR'});
            expect(cmds[0].message).toBe('my_value');
        });

        it('should ignore plain text lines (non-command lines)', async () => {
            const cmds = await collectCommands([
                'just plain output\n',
                '::warning::real cmd\n',
                'more plain text\n',
            ]);
            expect(cmds).toHaveLength(1);
            expect(cmds[0].command).toBe(StdoutCommandName.WARNING);
        });

        it('should handle \\r\\n line endings', async () => {
            const cmds = await collectCommands([
                '::notice::msg1\r\n::debug::msg2\r\n',
            ]);
            expect(cmds).toHaveLength(2);
            expect(cmds[0].command).toBe(StdoutCommandName.NOTICE);
            expect(cmds[0].message).toBe('msg1');
            expect(cmds[1].command).toBe(StdoutCommandName.DEBUG);
            expect(cmds[1].message).toBe('msg2');
        });

        it('should produce no commands for empty input', async () => {
            const cmds = await collectCommands([]);
            expect(cmds).toHaveLength(0);
        });

        it('should not emit a command for a line without a trailing newline at end of stream', async () => {
            // A line not terminated by \n is kept as unprocessed and never emitted
            const cmds = await collectCommands(['::warning::no-newline']);
            expect(cmds).toHaveLength(0);
        });

        it('should unescape percent-encoded values in command message', async () => {
            // The runner encodes '%' as '%25', ':' as '%3A', '\r' as '%0D'
            const cmds = await collectCommands([
                '::error::err%25msg\n',
            ]);
            expect(cmds).toHaveLength(1);
            expect(cmds[0].message).toBe('err%msg');
        });
    });

    describe('closed / waitUntilClosed', () => {
        it('should resolve waitUntilClosed after end() is called', async () => {
            const stream = new CommandsParsingStream();
            stream.on('data', () => {}); // put stream in flowing mode so 'close' fires
            stream.write('::debug::msg\n');
            stream.end();
            await expect(stream.waitUntilClosed()).resolves.toBeUndefined();
        });

        it('should resolve waitUntilClosed immediately if already closed', async () => {
            const stream = new CommandsParsingStream();
            stream.on('data', () => {}); // put stream in flowing mode so 'close' fires
            stream.end();
            await stream.waitUntilClosed();
            // calling again on an already-closed stream should still resolve
            await expect(stream.waitUntilClosed()).resolves.toBeUndefined();
        });
    });
});
