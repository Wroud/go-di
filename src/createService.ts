import { isArray } from 'util';

import {
  IScope,
  IService,
  GetParameters,
  GetService,
  GetFunctionService,
} from './scope';
import { IWithScope, isWithScope, scopeSymbol } from './withScope';

export const INJECTOR = Symbol('./injector');

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

export type InjectorList = Array<[string | symbol, IScopeService<any>]>;

export type ObjectInjectProperty<TKey extends string | symbol, TService> = {
  [P in TKey]: GetService<TService>
}

export interface IScopeService<T> extends IService<T> {
  <TKey extends string | symbol, TObject extends ObjectInjectProperty<TKey, T>>(
    target: TObject,
    propertyKey: TKey,
    descriptor?: undefined
  ): void;

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
  function service<TKey extends string | symbol, TObject extends ObjectInjectProperty<TKey, T>>(
    target: TObject,
    propertyKey: TKey,
    descriptor: undefined
  ): void;
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
      | Provider<GetFunctionService<T>, TArgs, TResult, TProvider>
      | ObjectInjectProperty<string | symbol, T>,
    ...params: GetParameters<T> | [string | symbol, undefined]
  ):
    | void
    | GetService<T>
    | GetFunctionService<T>
    | ProviderFunc<TArgs, TResult, TProvider> {
    if (
      typeof f === 'object'
      && params.length === 2
      && ['string', 'symbol'].includes(typeof params[0])
      && typeof params[1] === 'undefined'
    ) {
      if (!isArray(f[INJECTOR])) {
        Object.defineProperty(f, INJECTOR, { value: [] });
      }
      f[INJECTOR].push([params[0], service]);
      return;
    }
    if (typeof f === 'function') {
      return (fc, ...args) => f(service(fc, ...params as GetParameters<T>) as GetFunctionService<T> & GetService<T>)(
        fc,
        ...args,
      );
    }
    const scope: IScope = isWithScope(f as IWithScope) ? f[scopeSymbol] : f;

    return scope.get(service, params);
  }
  if (name) {
    Object.defineProperty(service, 'name', { value: name });
  }
  return service;
}
