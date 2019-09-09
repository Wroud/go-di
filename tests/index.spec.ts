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

    it('provides', () => {
        scope
            .attach(serviceA, testAValue)
            .attach(serviceB, testBValue);

        expect(scope.provide(() => (serviceA() || 0) + (serviceB() || 0))).to.be.equal(testAValue + testBValue);
    })
})
