export interface IService<T> {
  (f: IScope): T;
}

export type Factory<T, TObject> = (scope: IScope<TObject>, object: TObject) => T;

export enum ServiceType {
  Transient,
  Scoped,
  Singleton
}

export interface IServiceValue<T, TObject = any> {
  service: T | Factory<T, TObject> | (() => T);
  type: ServiceType;
  isFactory: boolean;
  value?: T;
}

export interface IScope<TObject = any> {
  object?: TObject;
  scope: Map<IService<any>, IServiceValue<any, TObject>>;
  attachFactory<T>(
    service: IService<T>,
    value: Factory<T, TObject>,
    isSingleton?: boolean
  ): this;
  attach<T>(service: IService<T>, value: T): this;
  detach<T>(service: IService<T>): this;
  get<T>(service: IService<T>): T;
  has(service: IService<any>): boolean;
}

export class Scope<TObject = any> implements IScope<TObject> {
  object?: TObject;
  scope: Map<IService<any>, IServiceValue<any, TObject>>;
  constructor(object?: TObject) {
    this.scope = new Map();
    this.object = object;
  }
  attachFactory<T>(
    service: IService<T>,
    value: Factory<T, TObject>,
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
  get<T>(service: IService<T>): T {
    const _service = this.scope.get(service);
    if (_service === undefined) {
      throw new Error(`Service not found`);
    }
    if (!_service.value || _service.type === ServiceType.Transient) {
      _service.value = _service.isFactory
        ? _service.service(this, this.object)
        : _service.service;
    }
    return _service.value;
  }
  has(service: IService<any>): boolean {
    return this.scope.has(service);
  }
  private _attach<T>(
    service: IService<T>,
    value: T | Factory<T, TObject>,
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
