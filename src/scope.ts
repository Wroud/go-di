export type GetParameters<T> = T extends Factory<any, any, infer Params>
  ? Params
  : T extends (...args: infer Params) => any
  ? Params
  : never;

export type GetService<T> = T extends Factory<any, infer TValue, any>
  ? TValue
  : T;
export type GetFunctionService<T> = T extends (...args: any) => infer R
  ? R
  : never;

export interface IService<T> {
  (f: IScope): GetService<T>;
  (f: IScope, ...params: GetParameters<T>): GetFunctionService<T>;
}

export type Factory<TObject, TValue, TParams extends any[]> = (
  scope: IScope<TObject>,
  object: TObject,
  ...params: TParams
) => TValue;

export enum ServiceType {
  Transient,
  Scoped,
  Singleton
}

export interface IServiceValue<T, TObject = any> {
  service: T | Factory<TObject, any, any> | ((...args: any) => T);
  type: ServiceType;
  isFactory: boolean;
  value?: T;
}

export interface IScope<TObject = any> {
  object?: TObject;
  scope: Map<IService<any>, IServiceValue<any, TObject>>;
  attachFactory<T extends Factory<TObject, any, any>>(
    service: IService<T>,
    value: T,
    isSingleton?: boolean
  ): this;
  attach<T>(service: IService<T>, value: T): this;
  detach<T>(service: IService<T>): this;
  get<T>(service: IService<T>): T;
  get<T extends (...args: any) => any>(
    service: IService<T>,
    params: GetParameters<T>
  ): ReturnType<T>;
  has(service: IService<any>): boolean;
}

export class Scope<TObject = any> implements IScope<TObject> {
  object?: TObject;
  scope: Map<IService<any>, IServiceValue<any, TObject>>;
  constructor(object?: TObject) {
    this.scope = new Map();
    this.object = object;
  }
  attachFactory<T extends Factory<TObject, any, any>>(
    service: IService<T>,
    value: T,
    isSingleton?: boolean
  ) {
    this._attach(
      service,
      value,
      isSingleton ? ServiceType.Singleton : ServiceType.Transient,
      true
    );
    return this;
  }
  attach<T>(service: IService<T>, value: T) {
    this._attach(service, value, ServiceType.Transient, false);
    return this;
  }
  detach<T>(service: IService<T>) {
    this.scope.delete(service);
    return this;
  }
  get<T>(service: IService<T>): T;
  get<T extends (...args: any) => any>(
    service: IService<T>,
    params: GetParameters<T>
  ): ReturnType<T>;
  get<T>(service: IService<T>, params?: any[]): T {
    const _service = this.scope.get(service);
    if (_service === undefined) {
      throw new Error(`Service not found`);
    }
    if (!_service.value || _service.type === ServiceType.Transient) {
      if (_service.isFactory) {
        _service.value = _service.service(this, this.object, ...(params || []));
      } else if (
        typeof _service.service === "function" &&
        params &&
        params.length > 0
      ) {
        _service.value = _service.service(...params);
      } else {
        _service.value = _service.service;
      }
    }
    return _service.value;
  }
  has(service: IService<any>): boolean {
    return this.scope.has(service);
  }
  private _attach<T>(
    service: IService<T>,
    value: T,
    type: ServiceType,
    isFactory: boolean
  ) {
    this.scope.set(service, {
      service: value,
      type,
      isFactory
    });
  }
}

export function isScope(obj): obj is IScope {
  return obj instanceof Scope;
}
