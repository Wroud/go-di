import { IServiceDescriptor } from './IServiceDescriptor';
import { IServiceProvider } from './IServiceProvider';

export interface IServiceValueGetter<TValue, TArgs extends any[]> {
  (descriptor: IServiceDescriptor<TValue, TArgs>, args: TArgs): TValue;
}

export interface IMiddleware {
  <TValue, TArgs extends any[]>(
    descriptor: IServiceDescriptor<TValue, TArgs>,
    provider: IServiceProvider,
    getValue: IServiceValueGetter<TValue, TArgs>,
    args: TArgs
  ): IServiceValueGetter<TValue, TArgs>;
}
