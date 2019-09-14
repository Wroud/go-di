import { expect } from "chai";
import "mocha";

import { createIService as createService, createService as createWService, createScope, withScope } from "../src/";

describe('createService', () => {
    const testAValue: number = 1;
    const testBValue: number = 2;
    const testCValue: number = 3;

    it('function', () => {
        const serviceA = createService<number>();
        const serviceB = createService<number>();
        expect(typeof serviceA).to.be.equal('function');
        expect(typeof serviceB).to.be.equal('function');
    })

    it('attaches', () => {
        const serviceA = createService<number>();
        const serviceB = createService<number>();
        const scope = createScope();
        scope
            .attach(serviceA, testAValue)
            .attach(serviceB, testBValue);

        expect(scope.provide(() => serviceA())).to.be.equal(testAValue);
        expect(scope.provide(() => serviceB())).to.be.equal(testBValue);
    })

    it('detaches', () => {
        const serviceA = createService<number>();
        const serviceB = createService<number>();
        const scope = createScope();
        scope
            .attach(serviceA, testAValue)
            .attach(serviceB, testBValue);

        expect(scope.provide(() => serviceA())).to.be.equal(testAValue);
        expect(scope.provide(() => serviceB())).to.be.equal(testBValue);

        scope
            .detach(serviceA)
            .detach(serviceB);

        expect(serviceA(scope)).to.be.equal(undefined);
        expect(serviceB(scope)).to.be.equal(undefined);
    })

    it('currying', () => {
        const serviceA = createService<number>();
        const serviceB = createService<number>();
        const scope = createScope();
        scope
            .attach(serviceA, testAValue)
            .attach(serviceB, testBValue);

        expect(scope.provide(() =>
            serviceA((a = 0) =>
                serviceB((b = 0) => a + b)
            )
        )).to.be.equal(testAValue + testBValue);
    })

    it('multiple scopes', () => {
        const serviceA = createService<number>();
        const serviceB = createService<number>();
        const scope = createScope();
        const scopeSecond = createScope();
        scope
            .attach(serviceB, testBValue);

        scopeSecond
            .attach(serviceA, testCValue);

        expect(scope.provide(() =>
            serviceB((a = 0) =>
                scopeSecond.provide(() => serviceA((b = 0) => a + b))
            )
        )).to.be.equal(testBValue + testCValue);
    })

    it('restores scope', () => {
        const serviceA = createService<number>();
        const serviceB = createService<number>();
        const scope = createScope();
        const scopeSecond = createScope();
        scope
            .attach(serviceB, testBValue);

        scopeSecond
            .attach(serviceA, testCValue);

        expect(scope.provide(() =>
            scopeSecond.provide(() => serviceA((b = 0) => b))
            +
            serviceB((a = 0) => a)
        )).to.be.equal(testBValue + testCValue);
    })

    it('scope inheritance', () => {
        const serviceA = createService<number>();
        const serviceB = createService<number>();
        const scope = createScope();
        const scopeSecond = createScope();
        scope
            .attach(serviceB, testBValue)
            .attach(serviceA, undefined);

        scopeSecond
            .attach(serviceA, testCValue);

        expect(scopeSecond.provide(() =>
            scope.provide(() => serviceA((b = 0) => b) + serviceB((a = 0) => a))
        )).to.be.equal(testBValue + testCValue);
    })

    it('with scope', () => {
        interface IStore { }
        const [obj, objScope] = withScope({} as IStore);
        const serviceA = createWService<number>();
        const serviceB = createWService<number>();
        const arg0 = 5;
        const arg1 = "hello"
        const fnc = (a: number, b: number, c: number, d: string) => (a + b + c) + d;

        objScope
            .attach(serviceA, testAValue)
            .attach(serviceB, testBValue);

        function caller<T>(
            f: (arg: typeof obj, othern: number, argt: string) => T,
            othern: number,
            argt: string
        ): T {
            return f(obj, othern, argt);
        }

        expect(serviceA(obj)).to.be.equal(testAValue);
        expect(serviceB(obj)).to.be.equal(testBValue);
        expect(caller(
            serviceB((b = 0) =>
                serviceA((a = 0) =>
                    (ps, arg0, arg1) => fnc(a, b, arg0, arg1)
                )
            ),
            arg0,
            arg1
        )).to.be.equal(fnc(testAValue, testBValue, arg0, arg1));
    })

    it('throw without scope', () => {
        const serviceA = createService<number>();
        const scope = createScope();
        scope.provide(() => { });
        expect(() => serviceA()).to.throw();
    })
})
