// From @actions/core command.js
import {unescapeCommandValue, unescapePropertyValue} from "../../../src/utils/commandsEscaping";

function escapeData(s: string) {
    return s
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s: string) {
    return s
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}

describe('commandsEscaping', () => {
    it('unescapeCommandValue', () => {
        expect(unescapeCommandValue(escapeData("abcdef"))).toEqual('abcdef');
        expect(unescapeCommandValue(escapeData("%\r"))).toEqual("%\r");
        expect(unescapeCommandValue(escapeData("%0D"))).toEqual("%0D");
    });

    it('unescapeCommandValue', () => {
        expect(unescapePropertyValue(escapeProperty("abcdef"))).toEqual('abcdef');
        expect(unescapePropertyValue(escapeProperty("%\r"))).toEqual("%\r");
        expect(unescapePropertyValue(escapeProperty(":%,"))).toEqual(":%,");
        expect(unescapePropertyValue(escapeProperty("%0D"))).toEqual("%0D");
    });
});