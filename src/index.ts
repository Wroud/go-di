export const scopeSymbol = Symbol();
export const attachSymbol = Symbol();
export const provideSymbol = Symbol();
let currentScope: WeakMap<Function, any>[] = [];

type WithScope<T> = [T & IAttachedScope, IScope];
type ServiceFunction<T, TFunc> = (service: T | undefined) => TFunc;
interface IService<T> {
    (): T | undefined;
    (f: IAttachedScope): T | undefined;
    <TFunc>(
        f: ServiceFunction<T, TFunc>
    ): TFunc;
}

interface IAttachedScope {
    [scopeSymbol]: WeakMap<Function, any>;
    [attachSymbol]<T>(service: IService<T>, value: T): IScope;
    [provideSymbol]<T>(f: () => T): T;
}

interface IScope extends IAttachedScope {
    scope: WeakMap<Function, any>;
    attach<T>(service: IService<T>, value: T): IScope;
    provide<T>(f: () => T): T;
}

export function isScope(obj): obj is IAttachedScope {
    return obj
        && scopeSymbol in obj
        && attachSymbol in obj
        && provideSymbol in obj;
}

export function createService<T>(): IService<T> {
    return function service<TFunc>(
        f?: ServiceFunction<T, TFunc> | IAttachedScope
    ): TFunc | T | undefined {
        if (isScope(f)) {
            return f[scopeSymbol].get(service);
        }
        const serviceValue: T | undefined = getService(service);
        return f
            ? f(serviceValue)
            : serviceValue;
    }
}

export function createScope(): IScope {
    return {
        [scopeSymbol]: new WeakMap(),
        [attachSymbol]<T>(service: IService<T>, value: T) {
            this[scopeSymbol].set(service, value);
            return this;
        },
        [provideSymbol]<T>(f: () => T): T {
            currentScope.unshift(this[scopeSymbol]);
            const service = f();
            currentScope.shift();
            return service;
        },
        get scope() {
            return this[scopeSymbol];
        },
        attach<T>(service: IService<T>, value: T) {
            return this[attachSymbol](service, value)
        },
        provide<T>(f: () => T): T {
            return this[provideSymbol](f);
        }
    }
}

export function withScope<T>(obj: T, scope?: IScope): WithScope<T> {
    scope = scope || createScope();
    obj[scopeSymbol] = scope[scopeSymbol];
    obj[attachSymbol] = scope[attachSymbol];
    obj[provideSymbol] = scope[provideSymbol];
    return [obj as T & IAttachedScope, scope];
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