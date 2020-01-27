import { ConstructorType } from './ConstructorType';
import {
  IServiceProvider,
  IService,
  IServiceCollection,
  IServiceDescriptor,
  IMiddlewarePipe,
  FunctionConstructor,
  ClassConstructor,
} from './interfaces';
import { ServiceType } from './ServiceType';

export class ServiceProvider implements IServiceProvider {
  private collection: IServiceCollection
  private serviceMap: Map<IService<any, any>, any>
  private middlewarePipe: IMiddlewarePipe
  private parent: IServiceProvider | undefined

  constructor(collection: IServiceCollection, middlewarePipe: IMiddlewarePipe, parent?: IServiceProvider) {
    this.collection = collection;
    this.serviceMap = new Map();
    this.middlewarePipe = middlewarePipe;
    this.parent = parent;
    this.getValue = this.getValue.bind(this);
  }
  getService<TValue, TArgs extends any[]>(service: IService<TValue, TArgs>, ...args: TArgs): TValue {
    if (this.serviceMap.has(service)) {
      return this.serviceMap.get(service) as TValue;
    }

    const descriptor = this.collection.get(service);
    if (!descriptor) {
      if (!this.parent) {
        throw new Error('Service descriptor not found');
      }

      return this.parent.getService(service, ...args);
    }

    if (descriptor.type === ServiceType.Singleton && this.parent) {
      return this.parent.getService(service, ...args);
    }

    const getValue = this.middlewarePipe.usePipe(descriptor, this, this.getValue, args);
    switch (descriptor.type) {
      case ServiceType.Scoped: {
        if (!this.parent) {
          throw new Error('Scope not provided');
        }
        const value = getValue(descriptor, args);
        this.serviceMap.set(service, value);
        return value;
      }
      case ServiceType.Singleton: {
        const value = getValue(descriptor, args);
        this.serviceMap.set(service, value);
        return value;
      }
      case ServiceType.Transient:
        return getValue(descriptor, args);
    }
  }
  resolveService<TValue>(service: IService<TValue, any>, value: TValue): this {
    this.serviceMap.set(service, value);
    return this;
  }
  createScope(collection?: IServiceCollection, middlewarePipe?: IMiddlewarePipe): IServiceProvider {
    return new ServiceProvider(collection || this.collection, middlewarePipe || this.middlewarePipe, this);
  }
  private getValue<TValue, TArgs extends any[]>(descriptor: IServiceDescriptor<TValue, TArgs>, args: TArgs): TValue {
    switch (descriptor.constructorType) {
      case ConstructorType.function:
        return (descriptor.implementation as FunctionConstructor<TValue, TArgs>)(
          this,
          ...args,
        );
      case ConstructorType.class:
        return new (descriptor.implementation as ClassConstructor<TValue, TArgs>)(
          this,
          ...args,
        );
      case ConstructorType.object:
        return descriptor.implementation as TValue;
    }
  }
}
