import { ConstructorType } from './ConstructorType';
import {
  IService,
  IServiceCollection,
  ClassConstructor,
  IServiceDescriptor,
  FunctionConstructor,
  IServiceProvider,
  IMiddlewarePipe,
} from './interfaces';
import { MiddlewarePipe } from './MiddlewarePipe';
import { ServiceDescriptor, ServiceDescriptorOptions } from './ServiceDescriptor';
import { ServiceProvider } from './ServiceProvider';
import { ServiceType } from './ServiceType';

export class ServiceCollection implements IServiceCollection {
  private descriptorMap: Map<IService<any, any>, IServiceDescriptor<any, any>>
  constructor() {
    this.descriptorMap = new Map();
  }
  has(service: IService<any, any>) {
    return this.descriptorMap.has(service);
  }
  get<TValue, TArgs extends any[]>(service: IService<TValue, TArgs>): IServiceDescriptor<TValue, TArgs> | undefined {
    return this.descriptorMap.get(service);
  }
  add(descriptor: IServiceDescriptor<any, any>): this{
    this.descriptorMap.set(descriptor.service, descriptor);
    return this;
  }
  addObject<T>(
    service: IService<T>,
    implementation: T,
    type: ServiceType = ServiceType.Transient,
  ): this {
    this._add({
      service,
      implementation,
      type,
      constructorType: ConstructorType.object,
    });
    return this;
  }
  addFunction<TValue, TArgs extends any[]>(
    service: IService<TValue, TArgs>,
    implementation: FunctionConstructor<TValue, TArgs>,
    type: ServiceType = ServiceType.Transient,
  ): this {
    this._add({
      service,
      implementation,
      type,
      constructorType: ConstructorType.function,
    });
    return this;
  }
  addClass<TValue, TArgs extends any[]>(
    service: IService<TValue, TArgs>,
    implementation: ClassConstructor<TValue, TArgs>,
    type: ServiceType = ServiceType.Transient,
  ): this {
    this._add({
      service,
      implementation,
      type,
      constructorType: ConstructorType.class,
    });
    return this;
  }
  getProvider(middlewarePipe?: (pipe: IMiddlewarePipe) => any): IServiceProvider {
    const pipe = new MiddlewarePipe();
    if (middlewarePipe) {
      middlewarePipe(pipe);
    }
    return new ServiceProvider(this, pipe);
  }

  private _add<TValue, TArgs extends any[]>(options: ServiceDescriptorOptions<TValue, TArgs>) {
    this.add(new ServiceDescriptor(options));
  }
}
