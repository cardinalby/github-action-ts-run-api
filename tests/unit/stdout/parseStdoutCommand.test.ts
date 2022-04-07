import {parseStdoutCommand} from "../../../src/stdout/parseStdoutCommand";

describe('parseStdoutCommand', () => {
    test.each([
        ['::warning::warning%0Dmsg', {name: 'warning', msg: "warning\rmsg", props: {}}],
        ['::ABC::m%25sg', {name: 'ABC', msg: "m%sg", props: {}}],
        ['::DEF::m%3Asg', {name: 'DEF', msg: "m%3Asg", props: {}}],
        ['::DEF::', {name: 'DEF', msg: undefined, props: {}}],
        ['::DEF a1=b%251,c1=d%3A2::', {name: 'DEF', msg: undefined, props: {a1: 'b%1', c1: 'd:2'}}],
        ['::dwe', undefined],
        ['dwewtt', undefined],
    ])(
        'should parse',
        (str, expected) => {
            const cmd = parseStdoutCommand(str);
            if (expected !== undefined) {
                expect(cmd).not.toBeUndefined();
                if (cmd) {
                    expect(cmd.command).toEqual(expected.name);
                    expect(cmd.message).toEqual(expected.msg);
                    expect(cmd.properties).toEqual(expected.props);
                }
            } else {
                expect(cmd).toBeUndefined()
            }
        }
    )
});