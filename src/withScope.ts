import { IScope, Scope } from './scope';

export const scopeSymbol = Symbol('@go-di/scope');

type WithScope<T> = [T & IWithScope<T>, IScope<T>];
export interface IWithScope<T = any> {
  [scopeSymbol]: IScope<T>;
}

export function withScope<T>(obj: T, scope?: IScope<T>): WithScope<T> {
  scope = scope || new Scope(obj);
  obj[scopeSymbol] = scope;
  return [obj as T & IWithScope<T>, scope];
}

export function isWithScope<T>(obj): obj is IWithScope<T> {
  return scopeSymbol in obj;
}
