export interface IService<T> {
  (f: IScope): T;
}

export enum ServiceType {
  Transient,
  Scoped,
  Singleton
}

export interface IServiceValue<T> {
  service: T | ((f: IScope) => T) | (() => T);
  type: ServiceType;
  isFactory: boolean;
  value?: T;
}

export interface IScope {
  scope: Map<IService<any>, IServiceValue<any>>;
  attachFactory<T>(
    service: IService<T>,
    value: (scope: IScope) => T,
    isSingleton?: boolean
  ): IScope;
  attach<T>(service: IService<T>, value: T): IScope;
  detach<T>(service: IService<T>): IScope;
  get<T>(service: IService<T>): T;
  has(service: IService<any>): boolean;
}

export class Scope implements IScope {
  scope: Map<IService<any>, IServiceValue<any>>;
  constructor() {
    this.scope = new Map();
  }
  attachFactory<T>(
    service: IService<T>,
    value: (scope: IScope) => T,
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
        ? _service.service(this)
        : _service.service;
    }
    return _service.value;
  }
  has(service: IService<any>): boolean {
    return this.scope.has(service);
  }
  private _attach<T>(
    service: IService<T>,
    value: T | ((scope: IScope) => T),
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
