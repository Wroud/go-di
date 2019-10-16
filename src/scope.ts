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

export type Factory<TObject, TValue, TParams extends any[]> = (
  scope: IScope<TObject>,
  object: TObject,
  ...params: TParams
) => TValue;

export interface IService<T> {
  (f: IScope): GetService<T>;
  (f: IScope, ...params: GetParameters<T>): GetFunctionService<T>;
}

export interface IGetServiceValue<T, TObject = any> {
  (service: IServiceValue<T, TObject>, params: any[]): GetService<T>;
}

export interface IMiddleware<TObject = any> {
  <T>(
    service: IServiceValue<T, TObject>,
    params: any[],
    value: IGetServiceValue<T, TObject>
  ): GetService<T>;
}

export enum ServiceType {
  Transient,
  Scoped,
  Singleton
}

export interface IServiceValue<T, TObject = any> {
  service: T | Factory<TObject, any, any> | ((...args: any) => T);
  type: ServiceType;
  isFactory: boolean;
  value?: GetService<T>;
  getName(): string;
}

export interface IScope<TObject = any> {
  object?: TObject;
  scope: Map<IService<any>, IServiceValue<any, TObject>>;
  middlewarePipe: IMiddleware<TObject>[];
  useMiddleware(middleware: IMiddleware<TObject>): this;
  attachFactory<T extends Factory<TObject, any, any>>(
    service: IService<T>,
    value: T,
    isSingleton?: boolean
  ): this;
  attach<T>(service: IService<T>, value: T): this;
  detach<T>(service: IService<T>): this;
  get<T>(service: IService<T>): GetService<T>;
  get<T extends (...args: any) => any>(
    service: IService<T>,
    params: GetParameters<T>
  ): GetFunctionService<T>;
  has(service: IService<any>): boolean;
}

export class Scope<TObject = any> implements IScope<TObject> {
  object?: TObject;
  scope: Map<IService<any>, IServiceValue<any, TObject>>;
  middlewarePipe: IMiddleware<TObject>[];
  isInitializationFinished: boolean;
  constructor(object?: TObject) {
    this.scope = new Map();
    this.object = object;
    this.middlewarePipe = [];
    this.isInitializationFinished = false;
  }
  useMiddleware(middleware: IMiddleware<TObject>) {
    if (this.isInitializationFinished) {
      throw new Error(
        "You can add middleware only before any service was requested"
      );
    }
    this.middlewarePipe.push(middleware);
    return this;
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
    this._attach(service, value, ServiceType.Singleton, false);
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
  get<T>(service: IService<T>, params: any[] = []): T {
    if (!this.isInitializationFinished) {
      this.isInitializationFinished = true;
    }
    const _service = this.scope.get(service);
    if (_service === undefined) {
      throw new Error(`Service not found`);
    }
    const scope = this;

    function getDefaultValue<T>(
      service: IServiceValue<T, TObject>,
      params: any[]
    ): GetService<T> {
      if (
        service.value !== undefined &&
        service.type !== ServiceType.Transient
      ) {
        return service.value as GetService<T>;
      }
      if (service.isFactory) {
        return (service.service as Factory<TObject, GetService<T>, any[]>)(
          scope,
          scope.object as any,
          ...params
        );
      }
      if (typeof service.service === "function" && params.length > 0) {
        return (service.service as (...args: any[]) => GetService<T>)(
          ...params
        );
      }
      return service.service as GetService<T>;
    }

    _service.value = this.middlewarePipe.reduce<
      <T>(service: IServiceValue<T, TObject>, params: any[]) => GetService<T>
    >(
      (value, middleware) => (service, params) =>
        middleware(service, params, value),
      getDefaultValue
    )(_service, params);

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
    function getName() {
      if (service.name === "service" && typeof value === "function") {
        return value.name;
      }
      return service.name;
    }
    this.scope.set(service, {
      service: value,
      type,
      isFactory,
      getName
    });
  }
}

export function isScope(obj): obj is IScope {
  return obj instanceof Scope;
}
