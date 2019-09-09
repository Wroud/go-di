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

let currentScope: WeakMap<Function, any> | undefined;

export function createService<T>(): IService<T> {
    return function service<TFunc>(
        f?: ServiceFunction<T, TFunc>
    ): TFunc | T | undefined {
        if (!currentScope) {
            throw new Error('No scope provided. Use scope(() => service())');
        }
        const serviceValue: T | undefined = currentScope.get(service);
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
            currentScope = this.scope;
            const service = f();
            currentScope = undefined;
            return service;
        }
    }
}