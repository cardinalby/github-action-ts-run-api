import {CommandsSanitizerStream} from "../../../src/stdout/CommandsSanitizerStream";
import {WritableStreamBuffer} from "../../../src/utils/WritableStreamBuffer";
import * as stream from "stream";
import {Readable} from "stream";
import os from "os";

describe('CommandsSanitizerStream', () => {
    test.each([
        [
            ['abc\n', 'def\n', 'ghi\n'],
            'abc' + os.EOL + 'def' + os.EOL + 'ghi' + os.EOL
        ], [
            ['abc\n', '::def\n', '::ghi   ::s\n', '::f::e\n'],
            'abc' + os.EOL + '::def' + os.EOL + '⦂⦂ghi   ⦂⦂s' + os.EOL + '⦂⦂f⦂⦂e' + os.EOL
        ], [
            ['abc\n', 'def'],
            'abc' + os.EOL + 'def'
        ]
    ])(
        'should sanitize',
        (chunks: string[], expectedResult: string) => {
            const sanitizer = new CommandsSanitizerStream();
            const result = new WritableStreamBuffer();
            const input = Readable.from(chunks);
            stream.pipeline([input, sanitizer, result], () => {
                expect(result.getContentsAsString()).toEqual(expectedResult);
            });
        });
});