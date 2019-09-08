import { expect } from "chai";
import "mocha";

import { createService, attachService, createScope } from "../src/";

describe('createService', () => {
    const service = createService<object>();
    const testObj: object = {};

    it('function', () => {
        expect(typeof service).to.be.equal('function');
    })

    it('attaches', () => {
        createScope(() => {
            attachService(service, testObj);
            expect(service()).to.be.equal(testObj);
        })
    })
})
