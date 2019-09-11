import { IScope, Scope, IService, isScope } from "./scope";

let currentScope: Array<Map<IService<any>, any>> = [];

export interface IIndependentScope extends IScope {
    provide<T>(f: () => T): T;
}

class IndependentScope extends Scope implements IIndependentScope {
    provide<T>(f: () => T): T {
        currentScope.unshift(this.scope);
        const service = f();
        currentScope.shift();
        return service;
    }
}

export function createScope(): IIndependentScope {
    return new IndependentScope();
}
type ServiceFunction<T, TFunc> = (service: T | undefined) => TFunc;
interface IScopeService<T> extends IService<T> {
    (): T | undefined;
    <TFunc>(
        f: ServiceFunction<T, TFunc>
    ): TFunc;
}

export function createIService<T>(): IScopeService<T> {
    return function service<TFunc>(
        f?: ServiceFunction<T, TFunc> | IScope
    ): TFunc | T | undefined {
        if (!f) {
            return getService<T>(service as IService<T>);
        }
        if (isScope(f)) {
            return f.get(service as IService<T>);
        }
        return f(getService<T>(service as IService<T>))
    }
}

export function getService<T>(service: IService<T>): T | undefined {
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