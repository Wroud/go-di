const callerMark = Symbol();

export function createService<T>() {
    function service(): T | undefined;
    function service<TArgs extends any[], U>(
        f: (service: T | undefined) => (...args: TArgs) => U
    ): ((...args: TArgs) => U);
    function service<TArgs extends any[], U>(
        f?: (service: T | undefined) => (...args: TArgs) => U
    ): ((...args: TArgs) => U) | T | undefined {
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

export function attachService<T>(service: () => T | undefined, value: T) {
    const scope = getScope<T>();
    if (scope) {
        scope.set(service, value);
    }
}

export function createScope(f: () => void) {
    f[callerMark] = new WeakMap();
    f();
}

function getScope<T>(): WeakMap<Function, T> | null {
    let caller: Function | null = null;
    while (true) {
        caller = getScope.caller;
        if (caller == null || caller[callerMark]) {
            break;
        }
    }
    return caller ? caller[callerMark] : null;
}