import {filterObjectKeys, mapObjectKeys} from "../../../src/utils/collections";

describe('collection utils', () => {
    it('mapObjectKeys', () => {
        const obj1 = {
            a: 4,
            b: 's',
        };
        Object.setPrototypeOf(obj1, {c: 10});

        expect(
            mapObjectKeys(obj1, (key, value) => key.toUpperCase() + value.toString())
        ).toEqual({A4: 4, Bs: 's'});
    });

    it('mapObjectKeys symbol', () => {
        const symbol = Symbol('ss');
        const obj1 = {
            [symbol]: 'f',
        };

        expect(
            mapObjectKeys(obj1, (key, value) => value)
        ).toEqual({});
    });

    it('filterObjectKeys', () => {
        const obj1 = {
            a: 4,
            b: 's',
            d: 'rt'
        };
        Object.setPrototypeOf(obj1, {c: 10});

        expect(
            filterObjectKeys(obj1, (key, value) => typeof value === 'string')
        ).toEqual({b: 's', d: 'rt'});
    });
});