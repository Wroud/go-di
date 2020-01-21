import { INJECTOR } from './createService';
import { IWithScope } from './withScope';

export interface IClassService<TArgs extends any[]>{
  new (services: IWithScope);
  new (services: IWithScope, ...args: TArgs);
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function injectable<T extends Constructor<any>>(constructor: T) {
  const Injector = class extends constructor {
    constructor(...rest: any[]) {
      constructor.prototype[INJECTOR].forEach(([key, service]) => this[key] = service(rest[0]));
      super(...rest);
    }
  };
  Object.defineProperty(Injector, 'name', { value: constructor.name });
  return Injector;
}
