export interface IService<T> {
    (f: IScope): T | undefined;
}

export interface IScope {
    scope: Map<IService<any>, any>;
    attach<T>(service: IService<T>, value: T): IScope;
    detach<T>(service: IService<T>): IScope;
    get<T>(service: IService<T>): T | undefined;
}

export class Scope implements IScope {
    scope: Map<IService<any>, any>;
    constructor() {
        this.scope = new Map();
    }
    attach<T>(service: IService<T>, value: T) {
        this.scope.set(service, value);
        return this;
    }
    detach<T>(service: IService<T>) {
        this.scope.delete(service);
        return this;
    }
    get<T>(service: IService<T>): T | undefined {
        return this.scope.get(service);
    }
}

export function isScope(obj): obj is IScope {
    return obj instanceof Scope;
}