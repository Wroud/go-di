import { IMiddlewarePipe } from './IMiddlewarePipe';
import { IService } from './IService';
import { IServiceCollection } from './IServiceCollection';

export interface IServiceProvider {
  getService<TValue, TArgs extends any[]>(service: IService<TValue, TArgs>, ...args: TArgs): TValue;
  resolveService<TValue>(service: IService<TValue, any>, value: TValue): this;
  createScope(collection?: IServiceCollection, middlewarePipe?: IMiddlewarePipe): IServiceProvider;
}
