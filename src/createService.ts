import { IScope, IService } from "./scope";
import { IWithScope, isWithScope, scopeSymbol } from "./withScope";

interface IScopeService<T> extends IService<T> {
    (f: IWithScope | IScope): T | undefined;
}

export function createService<T>(): IScopeService<T> {
    return function service(
        f: IScope | IWithScope
    ): T | undefined {
        if (isWithScope(f)) {
            return f[scopeSymbol].get(service as IService<T>);
        }
        return f.get(service as IService<T>);
    }
}