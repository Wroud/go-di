import { IServiceProvider } from './IServiceProvider';

export const PROVIDER = Symbol('@go-di/provider');

export interface IServiceProviderContainer {
  [PROVIDER]: IServiceProvider;
}
