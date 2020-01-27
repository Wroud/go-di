import { INJECTOR } from './createService';

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
