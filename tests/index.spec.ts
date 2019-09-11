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
        const [obj, objScope] = withScope({});
        const serviceA = createWService<number>();
        const serviceB = createWService<number>();

        objScope
            .attach(serviceA, testAValue)
            .attach(serviceB, testBValue);

        expect(serviceA(obj)).to.be.equal(testAValue);
        expect(serviceB(obj)).to.be.equal(testBValue);
    })

    it('throw without scope', () => {
        const serviceA = createService<number>();
        const scope = createScope();
        scope.provide(() => { });
        expect(() => serviceA()).to.throw();
    })
})
