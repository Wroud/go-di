import { IScope, IService } from "./scope";
import { IWithScope, isWithScope, scopeSymbol } from "./withScope";

type ProviderFunc<TArgs extends any[], TResult, TProvider extends IWithScope | IScope> =
    (f: TProvider, ...args: TArgs) => TResult;

type Provider<T, TArgs extends any[], TResult, TProvider extends IWithScope | IScope> =
    (service: T) => ProviderFunc<TArgs, TResult, TProvider>;

interface IScopeService<T> extends IService<T> {
    (f: IWithScope | IScope): T;
    <TArgs extends any[], TResult, TProvider extends IWithScope | IScope>(
        provider: Provider<T, TArgs, TResult, TProvider>
    ): ProviderFunc<TArgs, TResult, TProvider>;
}

export function createService<T>(): IScopeService<T> {
    function service(f: IWithScope | IScope): T;
    function service<TArgs extends any[], TResult, TProvider extends IWithScope | IScope>(
        provider: Provider<T, TArgs, TResult, TProvider>
    ): ProviderFunc<TArgs, TResult, TProvider>;
    function service<TArgs extends any[], TResult, TProvider extends IWithScope | IScope>(
        f: IScope | IWithScope | Provider<T, TArgs, TResult, TProvider>
    ): T | ProviderFunc<TArgs, TResult, TProvider> {
        if (typeof f === 'function') {
            return (fc, ...args) => f(service(fc))(fc, ...args);
        }
        const scope: IScope = isWithScope(f)
            ? f[scopeSymbol]
            : f;

        return scope.get(service as IService<T>);
    }
    return service;
}