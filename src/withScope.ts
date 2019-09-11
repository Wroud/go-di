import { IScope, Scope } from "./scope";

export const scopeSymbol = Symbol();

type WithScope<T> = [T & IWithScope, IScope];
export interface IWithScope {
    [scopeSymbol]: IScope;
}

export function withScope<T>(obj: T, scope?: IScope): WithScope<T> {
    scope = scope || new Scope();
    obj[scopeSymbol] = scope;
    return [obj as T & IWithScope, scope];
}

export function isWithScope(obj): obj is IWithScope {
    return scopeSymbol in obj;
}