type ServiceFunction<T, TFunc> = (service: T | undefined) => TFunc;
interface IService<T> {
    (): T | undefined;
    <TFunc>(
        f: ServiceFunction<T, TFunc>
    ): TFunc;
}
interface IScope {
    scope: WeakMap<Function, any>;
    attach<T>(service: IService<T>, value: T): IScope;
    provide<T>(f: () => T): T;
}

let currentScope: WeakMap<Function, any>[] = [];

export function createService<T>(): IService<T> {
    return function service<TFunc>(
        f?: ServiceFunction<T, TFunc>
    ): TFunc | T | undefined {
        const serviceValue: T | undefined = getService(service);
        return f
            ? f(serviceValue)
            : serviceValue;
    }
}

export function createScope(): IScope {
    return {
        scope: new WeakMap(),
        attach<T>(service: IService<T>, value: T) {
            this.scope.set(service, value);
            return this;
        },
        provide<T>(f: () => T): T {
            currentScope.unshift(this.scope);
            const service = f();
            currentScope.shift();
            return service;
        }
    }
}

function getService<T>(service: IService<T>): T | undefined {
    if (currentScope.length == 0) {
        throw new Error('No scope provided. Use scope(() => service())');
    }
    for (const list of currentScope) {
        const find = list.get(service);
        if (find != undefined) {
            return find;
        }
    }
    return undefined;
}