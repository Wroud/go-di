import {
  IScope,
  Scope,
  IService,
  isScope,
  GetParameters,
  GetFunctionService,
  GetService
} from "./scope";

let currentScope: Array<IndependentScope> = [];

export interface IIndependentScope extends IScope {
  provide<T>(f: () => T): T;
}
type ServiceFunction<T, TFunc> = (service: T) => TFunc;
export interface IScopeIService<T> extends IService<T> {
  (): GetService<T>;
  (f: null, ...params: GetParameters<T>): GetFunctionService<T>;
  <TFunc>(
    f: ServiceFunction<GetService<T>, TFunc>
  ): TFunc;
  <TFunc>(
    f: ServiceFunction<GetService<T>, TFunc>,
    ...params: GetParameters<T>
  ): TFunc;
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

export function createIService<T>(name?: string): IScopeIService<T> {
  function service<TFunc>(
    f?:
      | ServiceFunction<GetService<T>, TFunc>
      | ServiceFunction<GetFunctionService<T>, TFunc>
      | IScope
      | null,
    ...params: GetParameters<T>
  ): GetService<T> | GetFunctionService<T> | TFunc {
    if (!f) {
      return getService<T>(service, params);
    }
    if (isScope(f)) {
      return f.get(service as IService<(...args: any) => any>, params);
    }
    return f(getService<T>(service, params) as any);
  }

  if (name) {
    Object.defineProperty(service, "name", { value: name });
  }
  return service;
}

export function getService<T>(
  service: IService<T>,
  params: GetParameters<T>
): GetService<T> {
  if (currentScope.length == 0) {
    throw new Error("No scope provided. Use scope(() => service())");
  }
  for (const list of currentScope) {
    if (list.has(service)) {
      return list.get(
        (service as any) as IService<(...args: any) => any>,
        params
      );
    }
  }
  throw new Error(`Service not found`);
}
