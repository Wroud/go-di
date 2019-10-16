import {
  IScope,
  IService,
  GetParameters,
  GetService,
  GetFunctionService
} from "./scope";
import { IWithScope, isWithScope, scopeSymbol } from "./withScope";

type ProviderFunc<
  TArgs extends any[],
  TResult,
  TProvider extends IWithScope | IScope
> = (f: TProvider, ...args: TArgs) => TResult;

type Provider<
  T,
  TArgs extends any[],
  TResult,
  TProvider extends IWithScope | IScope
> = (service: T) => ProviderFunc<TArgs, TResult, TProvider>;

export interface IScopeService<T> extends IService<T> {
  (f: IWithScope | IScope): GetService<T>;
  (f: IWithScope | IScope, ...params: GetParameters<T>): GetFunctionService<T>;
  <TArgs extends any[], TResult, TProvider extends IWithScope | IScope>(
    provider: Provider<GetService<T>, TArgs, TResult, TProvider>
  ): ProviderFunc<TArgs, TResult, TProvider>;
  <TArgs extends any[], TResult, TProvider extends IWithScope | IScope>(
    provider: Provider<GetFunctionService<T>, TArgs, TResult, TProvider>,
    ...params: GetParameters<T>
  ): ProviderFunc<TArgs, TResult, TProvider>;
}

export function createService<T>(name?: string): IScopeService<T> {
  function service(f: IWithScope | IScope): GetService<T>;
  function service(
    f: IWithScope | IScope,
    ...params: GetParameters<T>
  ): GetFunctionService<T>;
  function service<
    TArgs extends any[],
    TResult,
    TProvider extends IWithScope | IScope
  >(
    provider: Provider<GetService<T>, TArgs, TResult, TProvider>
  ): ProviderFunc<TArgs, TResult, TProvider>;
  function service<
    TArgs extends any[],
    TResult,
    TProvider extends IWithScope | IScope
  >(
    provider: Provider<GetFunctionService<T>, TArgs, TResult, TProvider>,
    ...params: GetParameters<T>
  ): ProviderFunc<TArgs, TResult, TProvider>;
  function service<
    TArgs extends any[],
    TResult,
    TProvider extends IWithScope | IScope
  >(
    f:
      | IScope
      | IWithScope
      | Provider<GetService<T>, TArgs, TResult, TProvider>
      | Provider<GetFunctionService<T>, TArgs, TResult, TProvider>,
    ...params: GetParameters<T>
  ):
    | GetService<T>
    | GetFunctionService<T>
    | ProviderFunc<TArgs, TResult, TProvider> {
    if (typeof f === "function") {
      return (fc, ...args) =>
        f(service(fc, ...params) as GetFunctionService<T> & GetService<T>)(
          fc,
          ...args
        );
    }
    const scope: IScope = isWithScope(f) ? f[scopeSymbol] : f;

    return scope.get(service, params);
  }
  if (name) {
    Object.defineProperty(service, "name", { value: name });
  }
  return service;
}
