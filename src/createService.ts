import { isArray } from 'util';

import { isServiceProviderContainer } from './createServiceProviderContainer';
import {
  ClassConstructor,
  FunctionConstructor,
  IService,
  DecoratorFunction,
  IServiceProvider,
  IServiceProviderContainer,
  PROVIDER,
} from './interfaces';

export const INJECTOR = Symbol('@go-di/injector');

type GetValue<T> = T extends ClassConstructor<infer TValue, any>
  ? TValue
  : T extends FunctionConstructor<infer TValue, any>
    ? TValue
    : T;

type GetArgs<T> = T extends ClassConstructor<any, infer TArgs>
  ? TArgs
  : T extends FunctionConstructor<any, infer TArgs>
    ? TArgs
    : [];

export function createService<TService>(name?: string): IService<GetValue<TService>, GetArgs<TService>> {
  function service(): DecoratorFunction<GetValue<TService>>;
  function service(
    services: IServiceProvider | IServiceProviderContainer,
    ...args: GetArgs<TService>
  ): GetValue<TService>;
  function service(
    services?: IServiceProvider | IServiceProviderContainer,
    ...args: GetArgs<TService>
  ): GetValue<TService> | DecoratorFunction<GetValue<TService>> {
    if (typeof services === 'undefined') {
      return injector(service);
    }
    const provider = isServiceProviderContainer(services) ? services[PROVIDER] : services;

    return provider.getService(service, ...args);
  }
  if (name) {
    Object.defineProperty(service, 'name', { value: name });
  }

  return service;
}

function injector<TValue>(service: IService<TValue, any>) {
  return function decorator <TKey extends string | symbol, TObject extends Record<TKey, TValue>>(
    target: TObject,
    propertyKey: TKey,
  ) {
    if (!isArray(target[INJECTOR])) {
      Object.defineProperty(target, INJECTOR, { value: [] });
    }
    target[INJECTOR].push([propertyKey, service]);
  };
}
