import { IServiceProvider } from './IServiceProvider';
import { IServiceProviderContainer } from './IServiceProviderContainer';

export type DecoratorFunction<TValue> = <
  TKey extends string | symbol,
  TObject extends Record<TKey, TValue>
>(
  target: TObject,
  propertyKey: TKey,
  descriptor?: undefined
) => void;

export interface IService<TValue, TArgs extends any[] = []> {
  (): DecoratorFunction<TValue>;
  (services: IServiceProvider | IServiceProviderContainer, ...args: TArgs): TValue;
}
