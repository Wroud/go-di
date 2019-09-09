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
        const scope = getScope<T>();
        let serviceValue: T | undefined;
        if (scope && scope.has(service)) {
            serviceValue = scope.get(service);
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

function getScope<T>(): WeakMap<Function, T> | undefined {
    return currentScope;
}