import { expect } from "chai";
import "mocha";

import {
  createIService as createService,
  createService as createWService,
  createScope,
  withScope
} from "../src/";

describe("createService", () => {
  const testAValue: number = 1;
  const testBValue: number = 2;
  const testCValue: number = 3;

  it("function", () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    expect(typeof serviceA).to.be.equal("function");
    expect(typeof serviceB).to.be.equal("function");
  });

  it("attaches", () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    scope.attach(serviceA, testAValue).attach(serviceB, testBValue);

    expect(scope.provide(() => serviceA())).to.be.equal(testAValue);
    expect(scope.provide(() => serviceB())).to.be.equal(testBValue);
  });

  it("detaches", () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    scope.attach(serviceA, testAValue).attach(serviceB, testBValue);

    expect(scope.provide(() => serviceA())).to.be.equal(testAValue);
    expect(scope.provide(() => serviceB())).to.be.equal(testBValue);

    scope.detach(serviceA).detach(serviceB);

    expect(() => serviceA(scope)).to.throw(Error, "Service not found");
    expect(() => serviceB(scope)).to.throw(Error, "Service not found");
  });

  it("currying", () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    scope.attach(serviceA, testAValue).attach(serviceB, testBValue);

    expect(
      scope.provide(() => serviceA(a => serviceB(b => a + b)))
    ).to.be.equal(testAValue + testBValue);
  });

  it("multiple scopes", () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    const scopeSecond = createScope();
    scope.attach(serviceB, testBValue);

    scopeSecond.attach(serviceA, testCValue);

    expect(
      scope.provide(() =>
        serviceB(a => scopeSecond.provide(() => serviceA(b => a + b)))
      )
    ).to.be.equal(testBValue + testCValue);
  });

  it("restores scope", () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    const scopeSecond = createScope();
    scope.attach(serviceB, testBValue);

    scopeSecond.attach(serviceA, testCValue);

    expect(
      scope.provide(
        () => scopeSecond.provide(() => serviceA(b => b)) + serviceB(a => a)
      )
    ).to.be.equal(testBValue + testCValue);
  });

  it("scope inheritance", () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    const scopeSecond = createScope();
    scope.attach(serviceB, testBValue);

    scopeSecond.attach(serviceA, testCValue);

    expect(
      scopeSecond.provide(() =>
        scope.provide(() => serviceA(b => b) + serviceB(a => a))
      )
    ).to.be.equal(testBValue + testCValue);
  });

  it("with scope", () => {
    interface IStore {}
    const [obj, objScope] = withScope({} as IStore);
    const serviceA = createWService<number>();
    const serviceB = createWService<number>();
    const arg0 = 5;
    const arg1 = "hello";
    const fnc = (a: number, b: number, c: number, d: string) => a + b + c + d;

    objScope.attach(serviceA, testAValue).attach(serviceB, testBValue);

    function caller<T>(
      f: (arg: typeof obj, othern: number, argt: string) => T,
      othern: number,
      argt: string
    ): T {
      return f(obj, othern, argt);
    }

    expect(serviceA(obj)).to.be.equal(testAValue);
    expect(serviceB(obj)).to.be.equal(testBValue);
    expect(
      caller(
        serviceB(b => serviceA(a => (ps, arg0, arg1) => fnc(a, b, arg0, arg1))),
        arg0,
        arg1
      )
    ).to.be.equal(fnc(testAValue, testBValue, arg0, arg1));
  });

  it("factory withScope", () => {
    interface IStore {}
    const [obj, objScope] = withScope({} as IStore);
    const serviceA = createWService<number>();
    const serviceB = createWService<number>();
    const serviceC = createWService<number>();
    const arg0 = 5;
    const arg1 = "hello";
    const fnc = (a: number, b: number, c: number, d: string, e: number) =>
      a + b + c + e + d;

    objScope
      .attach(serviceA, testAValue)
      .attach(serviceB, testBValue)
      .attachFactory(serviceC, (scope, _obj) => {
        expect(_obj).to.be.equal(obj);
        return serviceA(scope) + serviceB(scope);
      });

    function caller<T>(
      f: (arg: typeof obj, othern: number, argt: string) => T,
      othern: number,
      argt: string
    ): T {
      return f(obj, othern, argt);
    }

    expect(serviceA(obj)).to.be.equal(testAValue);
    expect(serviceB(obj)).to.be.equal(testBValue);
    expect(serviceC(obj)).to.be.equal(testAValue + testBValue);
    expect(
      caller(
        serviceB(b =>
          serviceA(a =>
            serviceC(c => (ps, arg0, arg1) => fnc(a, b, arg0, arg1, c))
          )
        ),
        arg0,
        arg1
      )
    ).to.be.equal(
      fnc(testAValue, testBValue, arg0, arg1, testAValue + testBValue)
    );
  });

  it("throw without scope", () => {
    const serviceA = createService<number>();
    const scope = createScope();
    scope.provide(() => {});
    expect(() => serviceA()).to.throw();
  });

  it("factory", () => {
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

  it("Singleton factory", () => {
    const serviceA = createService<number>();
    const scope = createScope();
    let i = 0;
    scope.attachFactory(
      serviceA,
      () => {
        i++;
        return i;
      },
      true
    );
    expect(serviceA(scope)).to.be.equal(1);
    expect(serviceA(scope)).to.be.equal(1);
    expect(i).to.be.equal(1);
  });
});
