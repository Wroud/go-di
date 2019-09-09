type ServiceFunction<T, TFunc> = (service: T | undefined) => TFunc;
interface IService<T> {
    (): T | undefined;
    <TFunc>(
        f: ServiceFunction<T, TFunc>
    ): TFunc;
}

let currentScope: WeakMap<Function, any> | undefined;

export function createService<T>(): IService<T> {
    function service<TFunc>(
        f?: ServiceFunction<T, TFunc>
    ): TFunc | T | undefined {
        let serviceValue: T | undefined;
        if (currentScope && currentScope.has(service)) {
            serviceValue = currentScope.get(service);
        }
        return f
            ? f(serviceValue)
            : serviceValue;
    }
    return service;
}

export function createScope() {
    const scope = new WeakMap();
    return {
        attach<T>(service: IService<T>, value: T) {
            scope.set(service, value);
            return this;
        },
        provide<T>(f: () => T): T {
            currentScope = scope;
            return f();
        }
    }
}