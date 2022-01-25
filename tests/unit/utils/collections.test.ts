import {filterObjectKeys, mapObject, mapObjectKeys, mapObjectValues, mapToObject} from "../../../src/utils/collections";

describe('collection utils', () => {
    it('mapObjectKeys', () => {
        const obj1 = {
            a: 4,
            b: 's',
            [Symbol('ss')]: 'f'
        };
        Object.setPrototypeOf(obj1, {c: 10});

        expect(
            mapObjectKeys(obj1, (key, value) => key.toUpperCase() + value.toString())
        ).toEqual({A4: 4, Bs: 's'});
    });

    it('mapObjectValues', () => {
        const obj1 = {
            a: 4,
            b: 's',
            [Symbol('ss')]: 'f'
        };
        Object.setPrototypeOf(obj1, {c: 10});

        expect(
            mapObjectValues(obj1, (key, value) => key.toUpperCase() + value.toString())
        ).toEqual({a: 'A4', b: 'Bs'});
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

    it('mapObject', () => {
        const obj1 = {
            a: 4,
            b: 's',
            d: 'rt'
        };
        Object.setPrototypeOf(obj1, {c: 10});

        expect(
            mapObject(obj1, (key, value) => [key.toUpperCase(), key + value])
        ).toEqual({A: 'a4', B: 'bs', D: 'drt'});
    });

    it('mapToObject', () => {
        const map = new Map<string, number>([
            ['a', 3],
            ['b', 4],
            ['c', 5],
        ]);

        expect(
            mapToObject(map, (key, value) => [key.toUpperCase(), value * 2])
        ).toEqual({
            A: 6,
            B: 8,
            C: 10
        });
    });
});