import { ConstructorType } from './ConstructorType';
import {
  IServiceDescriptor, FunctionConstructor, ClassConstructor, IService,
} from './interfaces';
import { ServiceType } from './ServiceType';

export type ServiceDescriptorOptions<TValue, TArgs extends any[]> = {
  service: IService<TValue, TArgs>;
  type: ServiceType;
  constructorType: ConstructorType;
  implementation: TValue | FunctionConstructor<TValue, TArgs> | ClassConstructor<TValue, TArgs>;
}

export class ServiceDescriptor<TValue, TArgs extends any[]> implements IServiceDescriptor<TValue, TArgs> {
  service: IService<TValue, TArgs>;
  type: ServiceType;
  constructorType: ConstructorType;
  implementation: TValue | FunctionConstructor<TValue, TArgs> | ClassConstructor<TValue, TArgs>
  public get name() {
    return this._name;
  }
  private _name: string;

  constructor(options: ServiceDescriptorOptions<TValue, TArgs>) {
    this.service = options.service;
    this.type = options.type;
    this.implementation = options.implementation;
    this.constructorType = options.constructorType;

    if (this.service.name === 'service' && typeof this.implementation === 'function') {
      this._name = this.implementation.name;
    } else {
      this._name = this.service.name;
    }
  }
}
