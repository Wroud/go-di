import { expect } from "chai";
import "mocha";

import { createService, createScope } from "../src/";

describe('createService', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    const scopeSecond = createScope();
    const testAValue: number = 1;
    const testBValue: number = 2;
    const testCValue: number = 3;

    it('function', () => {
        expect(typeof serviceA).to.be.equal('function');
        expect(typeof serviceB).to.be.equal('function');
    })

    it('attaches', () => {
        scope
            .attach(serviceA, testAValue)
            .attach(serviceB, testBValue);

        expect(scope.provide(() => serviceA())).to.be.equal(testAValue);
        expect(scope.provide(() => serviceB())).to.be.equal(testBValue);
    })

    it('currying', () => {
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

    it('throw without scope', () => {
        scope.provide(() => { });
        expect(() => serviceA()).to.throw();
    })
})
