export function mapObjectKeys<T>(
    obj: T,
    mapper: (key: string, value: T[keyof T]) => string
): {[key: string]: T[keyof T]} {
    return Object.fromEntries(Object.entries(obj).map(
        entry => [mapper(entry[0], entry[1]), entry[1]]
    ));
}

export function mapObjectValues<T, R>(
    obj: T,
    mapper: (key: string, value: T[keyof T]) => R
): {[key: string]: R} {
    return Object.fromEntries(Object.entries(obj).map(
        entry => [entry[0], mapper(entry[0], entry[1])]
    ));
}

export function mapObject<SrcK extends string, SrcV, ResK extends string, ResV>(
    obj: {[k in SrcK]: SrcV},
    mapper: (key: SrcK, value: SrcV) => [ResK, ResV]
): {[key in ResK]: ResV} {
    return Object.fromEntries(Object.entries(obj).map(
        entry => mapper(entry[0] as SrcK, entry[1] as SrcV)
    )) as {[key in ResK]: ResV};
}

export function filterObjectKeys<T>(
    obj: T,
    filter: (key: string, value: T[keyof T]) => boolean
): {[key: string]: T[keyof T]} {
    return Object.fromEntries(Object.entries(obj)
        .filter(entry => filter(entry[0], entry[1] as T[keyof T]))
    );
}

export function mapToObject<MapK extends string, MapV, ResK extends string, ResV>(
    map: Map<MapK, MapV>,
    mapperFn: (key: MapK, value: MapV) => [ResK, ResV]
): {[k in ResK]: ResV} {
    const res = {} as {[k in ResK]: ResV};
    map.forEach((value, key) => {
        const mapperResult = mapperFn(key, value);
        res[mapperResult[0]] = mapperResult[1];
    });
    return res;
}