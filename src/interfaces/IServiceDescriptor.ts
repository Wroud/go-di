import { ConstructorType } from '../ConstructorType';
import { ServiceType } from '../ServiceType';
import { IService } from './IService';
import { IServiceProvider } from './IServiceProvider';

export type FunctionConstructor<TValue, TArgs extends any[]> = {
  (services: IServiceProvider, ...args: TArgs): TValue;
}

export interface ClassConstructor<TValue, TParams extends any[]> {
  new (services: IServiceProvider, ...args: TParams): TValue;
}

export interface IServiceDescriptor<TValue, TArgs extends any[]>{
  service: IService<TValue, TArgs>;
  implementation: TValue | FunctionConstructor<TValue, TArgs> |ClassConstructor<TValue, TArgs>;
  type: ServiceType;
  constructorType: ConstructorType;
  readonly name: string;
}
