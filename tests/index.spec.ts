import { expect } from 'chai';
import 'mocha';

import {
  createIService as createService,
  createService as createWService,
  createScope,
  withScope,
  IScope,
  injectable,
} from '../src';

describe('createService', () => {
  const testAValue = 1;
  const testBValue = 2;
  const testCValue = 3;

  it('function', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    expect(typeof serviceA).to.be.equal('function');
    expect(typeof serviceB).to.be.equal('function');
  });

  it('service has name', () => {
    const serviceA = createService<number>('name1');
    const serviceB = createWService<number>('name2');
    expect(serviceA.name).to.be.equal('name1');
    expect(serviceB.name).to.be.equal('name2');
  });

  it('factory overrides name', () => {
    const scope = createScope();
    const serviceC = createService<typeof serviceCFunc>();

    function serviceCFunc(scope: IScope, _obj: any) {}

    scope
      .attachFactory(serviceC, serviceCFunc)
      .useMiddleware((service, params, value) => {
        expect(service.getName()).to.be.equal('serviceCFunc');
        return value(service, params);
      });

    scope.provide(() => serviceC(null));
  });

  it('attaches', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    scope.attach(serviceA, testAValue).attach(serviceB, testBValue);

    expect(scope.provide(() => serviceA())).to.be.equal(testAValue);
    expect(scope.provide(() => serviceB())).to.be.equal(testBValue);
  });

  it('detaches', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    scope.attach(serviceA, testAValue).attach(serviceB, testBValue);

    expect(scope.provide(() => serviceA())).to.be.equal(testAValue);
    expect(scope.provide(() => serviceB())).to.be.equal(testBValue);

    scope.detach(serviceA).detach(serviceB);

    expect(() => serviceA(scope)).to.throw(Error, 'Service not found');
    expect(() => serviceB(scope)).to.throw(Error, 'Service not found');
  });

  it('currying', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    scope.attach(serviceA, testAValue).attach(serviceB, testBValue);

    expect(
      scope.provide(() => serviceA(a => serviceB(b => a + b))),
    ).to.be.equal(testAValue + testBValue);
  });

  it('multiple scopes', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    const scopeSecond = createScope();
    scope.attach(serviceB, testBValue);

    scopeSecond.attach(serviceA, testCValue);

    expect(
      scope.provide(() => serviceB(a => scopeSecond.provide(() => serviceA(b => a + b)))),
    ).to.be.equal(testBValue + testCValue);
  });

  it('restores scope', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    const scopeSecond = createScope();
    scope.attach(serviceB, testBValue);

    scopeSecond.attach(serviceA, testCValue);

    expect(
      scope.provide(
        () => scopeSecond.provide(() => serviceA(b => b)) + serviceB(a => a),
      ),
    ).to.be.equal(testBValue + testCValue);
  });

  it('scope inheritance', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    const scopeSecond = createScope();
    scope.attach(serviceB, testBValue);

    scopeSecond.attach(serviceA, testCValue);

    expect(
      scopeSecond.provide(() => scope.provide(() => serviceA(b => b) + serviceB(a => a))),
    ).to.be.equal(testBValue + testCValue);
  });

  it('with scope', () => {
    interface IStore {}
    const [obj, objScope] = withScope({} as IStore);
    const serviceA = createWService<number>();
    const serviceB = createWService<number>();
    const arg0 = 5;
    const arg1 = 'hello';
    const fnc = (a: number, b: number, c: number, d: string) => a + b + c + d;

    objScope.attach(serviceA, testAValue).attach(serviceB, testBValue);

    function caller<T>(
      f: (arg: typeof obj, othern: number, argt: string) => T,
      othern: number,
      argt: string,
    ): T {
      return f(obj, othern, argt);
    }

    expect(serviceA(obj)).to.be.equal(testAValue);
    expect(serviceB(obj)).to.be.equal(testBValue);
    expect(
      caller(
        serviceB(b => serviceA(a => (ps, arg0, arg1) => fnc(a, b, arg0, arg1))),
        arg0,
        arg1,
      ),
    ).to.be.equal(fnc(testAValue, testBValue, arg0, arg1));
  });

  it('factory withScope', () => {
    interface IStore {}
    const [obj, objScope] = withScope({} as IStore);
    const serviceA = createWService<number>();
    const serviceB = createWService<number>();
    const serviceC = createWService<typeof serviceCFunc>();
    const arg0 = 5;
    const arg1 = 'hello';
    const fnc = (a: number, b: number, c: number, d: string, e: number) => a + b + c + e + d;

    function serviceCFunc(scope: IScope<IStore>, _obj: IStore) {
      expect(_obj).to.be.equal(obj);
      return serviceA(scope) + serviceB(scope);
    }

    objScope
      .attach(serviceA, testAValue)
      .attach(serviceB, testBValue)
      .attachFactory(serviceC, serviceCFunc);

    function caller<T>(
      f: (arg: typeof obj, othern: number, argt: string) => T,
      othern: number,
      argt: string,
    ): T {
      return f(obj, othern, argt);
    }

    expect(serviceA(obj)).to.be.equal(testAValue);
    expect(serviceB(obj)).to.be.equal(testBValue);
    expect(serviceC(obj)).to.be.equal(testAValue + testBValue);
    expect(
      caller(
        serviceB(b => serviceA(a => serviceC(c => (ps, arg0, arg1) => fnc(a, b, arg0, arg1, c)))),
        arg0,
        arg1,
      ),
    ).to.be.equal(
      fnc(testAValue, testBValue, arg0, arg1, testAValue + testBValue),
    );
  });

  it('throw without scope', () => {
    const serviceA = createService<number>();
    const scope = createScope();
    scope.provide(() => {});
    expect(() => serviceA()).to.throw();
  });

  it('factory', () => {
    const serviceA = createService<number>();
    const scope = createScope();
    let i = 0;
    scope.attachFactory(serviceA, () => {
      i++;
      return i;
    });
    expect(serviceA(scope)).to.be.equal(1);
    expect(serviceA(scope)).to.be.equal(2);
    expect(i).to.be.equal(2);
  });

  it('Singleton factory', () => {
    const serviceA = createService<number>();
    const scope = createScope();
    let i = 0;
    scope.attachFactory(
      serviceA,
      () => {
        i++;
        return i;
      },
      true,
    );
    expect(serviceA(scope)).to.be.equal(1);
    expect(serviceA(scope)).to.be.equal(1);
    expect(i).to.be.equal(1);
  });

  describe('short call', () => {
    it('withScope', () => {
      interface IStore {}
      const [obj, objScope] = withScope({} as IStore);
      const serviceC = createWService<typeof serviceCFunc>();

      function serviceCFunc(scope: IScope<IStore>, _obj: IStore, arg: string) {
        return arg;
      }

      objScope.attachFactory(serviceC, serviceCFunc);

      expect(serviceC(obj, 'value')).to.be.equal('value');
      expect(serviceC(v => () => v, 'value')(obj)).to.be.equal('value');
    });
    it('independent', () => {
      const scope = createScope();
      const serviceC = createService<typeof serviceCFunc>();

      function serviceCFunc(arg: string) {
        return arg;
      }

      scope.attach(serviceC, serviceCFunc);

      expect(serviceC(scope, 'value')).to.be.equal('value');
      expect(scope.provide(() => serviceC(v => v, 'value'))).to.be.equal(
        'value',
      );
    });
  });

  describe('middleware', () => {
    it('independent', () => {
      const scope = createScope();
      const serviceC = createService<typeof serviceCFunc>();

      function serviceCFunc(scope: IScope, _obj: any, arg: string) {
        return arg;
      }

      scope
        .attachFactory(serviceC, serviceCFunc)
        .useMiddleware((service, params, value) => {
          expect(params[0]).to.be.equal('value');
          return value(service, params);
        });

      expect(scope.provide(() => serviceC(null, 'value'))).to.be.equal('value');
      expect(scope.provide(() => serviceC(v => v, 'value'))).to.be.equal(
        'value',
      );
    });
    it('withScope', () => {
      interface IStore {}
      const [obj, objScope] = withScope({} as IStore);
      const serviceC = createWService<typeof serviceCFunc>();

      function serviceCFunc(scope: IScope<IStore>, _obj: IStore, arg: string) {
        return arg;
      }

      objScope
        .attachFactory(serviceC, serviceCFunc)
        .useMiddleware((service, params, value) => {
          expect(params[0]).to.be.equal('value');
          return value(service, params);
        });

      expect(serviceC(obj, 'value')).to.be.equal('value');
      expect(serviceC(v => () => v, 'value')(obj)).to.be.equal('value');
    });
  });
});

describe('Decorator', () => {
  it('function', () => {
    const testValue = 1;

    class ServiceA {
      a = testValue
    }
    const serviceA = createWService<ServiceA>();

    @injectable
    class ServiceB {
      @serviceA a!: ServiceA;
    }
    const serviceB = createWService<ServiceB>();
    interface IStore {}
    const [obj, objScope] = withScope({} as IStore);

    objScope.attachClass(serviceA, ServiceA);
    objScope.attachClass(serviceB, ServiceB);

    expect(serviceB(obj).a.a).to.be.equal(testValue);
  });
});
