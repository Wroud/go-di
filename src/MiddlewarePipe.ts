import {
  IMiddlewarePipe, IMiddleware, IServiceDescriptor, IServiceProvider, IServiceValueGetter,
} from './interfaces';

export class MiddlewarePipe implements IMiddlewarePipe {
  private middleware: IMiddleware[]
  constructor() {
    this.middleware = [];
  }
  addMiddleware(middleware: IMiddleware) {
    this.middleware.push(middleware);
    return this;
  }
  usePipe<TValue, TArgs extends any[]>(
    descriptor: IServiceDescriptor<TValue, TArgs>,
    provider: IServiceProvider,
    getValue: IServiceValueGetter<TValue, TArgs>,
    args: TArgs,
  ): IServiceValueGetter<TValue, TArgs> {
    return this.middleware.reduce((value, middleware) => middleware(descriptor, provider, value, args), getValue);
  }
}
