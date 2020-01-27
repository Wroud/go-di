import { ServiceType } from '../ServiceType';
import { IMiddlewarePipe } from './IMiddlewarePipe';
import { IService } from './IService';
import { IServiceDescriptor, ClassConstructor, FunctionConstructor } from './IServiceDescriptor';
import { IServiceProvider } from './IServiceProvider';

export interface IServiceCollection {
  has(service: IService<any, any>): boolean;
  get<TValue, TArgs extends any[]>(service: IService<TValue, TArgs>): IServiceDescriptor<TValue, TArgs> | undefined;
  add(descriptor: IServiceDescriptor<any, any>): this;
  addObject<T>(
    service: IService<T>,
    implementation: T,
    type?: ServiceType
  ): this;
  addFunction<TValue, TArgs extends any[]>(
    service: IService<TValue, TArgs>,
    implementation: FunctionConstructor<TValue, TArgs>,
    type?: ServiceType
  ): this;
  addClass<TValue, TArgs extends any[]>(
    service: IService<TValue, TArgs>,
    implementation: ClassConstructor<TValue, TArgs>,
    type?: ServiceType
  ): this;
  getProvider(middlewarePipe?: (pipe: IMiddlewarePipe) => any): IServiceProvider;
}
