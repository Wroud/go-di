import { IScope, Scope, IService, isScope } from "./scope";

let currentScope: Array<IndependentScope> = [];

export interface IIndependentScope extends IScope {
  provide<T>(f: () => T): T;
}

class IndependentScope extends Scope implements IIndependentScope {
  provide<T>(f: () => T): T {
    currentScope.unshift(this);
    const service = f();
    currentScope.shift();
    return service;
  }
}

export function createScope(): IIndependentScope {
  return new IndependentScope();
}
type ServiceFunction<T, TFunc> = (service: T) => TFunc;
export interface IScopeIService<T> extends IService<T> {
  (): T;
  <TFunc>(f: ServiceFunction<T, TFunc>): TFunc;
}

export function createIService<T>(): IScopeIService<T> {
  return function service<TFunc>(
    f?: ServiceFunction<T, TFunc> | IScope
  ): TFunc | T {
    if (!f) {
      return getService<T>(service as IService<T>);
    }
    if (isScope(f)) {
      return f.get(service as IService<T>);
    }
    return f(getService<T>(service as IService<T>));
  };
}

export function getService<T>(service: IService<T>): T {
  if (currentScope.length == 0) {
    throw new Error("No scope provided. Use scope(() => service())");
  }
  for (const list of currentScope) {
    if (list.has(service)) {
      return list.get(service);
    }
  }
  throw new Error(`Service not found`);
}
