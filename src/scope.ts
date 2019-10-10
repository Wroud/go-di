export interface IService<T> {
  (f: IScope): T;
}

export interface IServiceValue<T> {
  service: T | ((f: IScope) => T) | (() => T);
  isFactory: boolean;
}

export interface IScope {
  scope: Map<IService<any>, IServiceValue<any>>;
  attachFactory<T>(service: IService<T>, value: (scope: IScope) => T): IScope;
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
  attachFactory<T>(service: IService<T>, value: (scope: IScope) => T) {
    this.scope.set(service, { service: value, isFactory: true });
    return this;
  }
  attach<T>(service: IService<T>, value: T) {
    this.scope.set(service, { service: value, isFactory: false });
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
    return _service.isFactory ? _service.service(this) : _service.service;
  }
  has(service: IService<any>): boolean {
    return this.scope.has(service);
  }
}

export function isScope(obj): obj is IScope {
  return obj instanceof Scope;
}
