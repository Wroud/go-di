import { IMiddleware, IServiceValueGetter } from './IMiddleware';
import { IServiceDescriptor } from './IServiceDescriptor';
import { IServiceProvider } from './IServiceProvider';

export interface IMiddlewarePipe {
  addMiddleware(middleware: IMiddleware): this;
  usePipe<TValue, TArgs extends any[]>(
    descriptor: IServiceDescriptor<TValue, TArgs>,
    provider: IServiceProvider,
    getValue: IServiceValueGetter<TValue, TArgs>,
    args: TArgs
  ): IServiceValueGetter<TValue, TArgs>;
}
