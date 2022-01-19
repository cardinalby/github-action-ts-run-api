export class AbstractStore<T extends {}, CH = T> {
    constructor(
        protected _data: T = {} as T
    ) {}

    clone(): this {
        return new (<any>this.constructor)({...this._data});
    }

    get data(): T {
        return this._data;
    }

    setData(obj: T): this {
        this._data = obj;
        return this;
    }

    apply(changes: CH): this {
        for (let [name, value] of Object.entries(changes)) {
            if (value !== undefined) {
                (this._data as any)[name] = value;
            } else {
                delete (this._data as any)[name];
            }
        }
        return this;
    }
}