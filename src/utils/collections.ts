export function mapObjectKeys<T>(
    obj: T,
    mapper: (key: string, value: T[keyof T]) => string
): {[key: string]: T[keyof T]} {
    return Object.fromEntries(Object.entries(obj).map(
        entry => [mapper(entry[0], entry[1]), entry[1]]
    ));
}

export function filterObjectKeys<T>(
    obj: T,
    filter: (key: string, value: T[keyof T]) => boolean
): {[key: string]: T[keyof T]} {
    return Object.fromEntries(Object.entries(obj)
        .filter(entry => filter(entry[0], entry[1] as T[keyof T]))
    );
}