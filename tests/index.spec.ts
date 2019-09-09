import { expect } from "chai";
import "mocha";

import { createService, createScope } from "../src/";

describe('createService', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const scope = createScope();
    const testAValue: number = 1;
    const testBValue: number = 2;

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

    it('throw without scope', () => {
        scope.provide(() => { });
        expect(() => serviceA()).to.throw();
    })
})
