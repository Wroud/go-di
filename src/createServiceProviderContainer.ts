import { IServiceProvider, IServiceProviderContainer, PROVIDER } from './interfaces';

export function createServiceProviderContainer<T>(
  object: T,
  provider: IServiceProvider,
): T & IServiceProviderContainer {
  object[PROVIDER] = provider;
  return object as T & IServiceProviderContainer;
}

export function isServiceProviderContainer<T>(obj: T): obj is T & IServiceProviderContainer {
  return PROVIDER in obj;
}
