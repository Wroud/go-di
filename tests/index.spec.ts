import { expect } from 'chai';
import 'mocha';

import {
  createService,
  ServiceCollection,
  IServiceProvider,
  ServiceType,
  createServiceProviderContainer,
  injectable,
} from '../src';

describe('createService', () => {
  const testAValue = 1;
  const testBValue = 2;
  // const testCValue = 3;

  it('function', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    expect(typeof serviceA).to.be.equal('function');
    expect(typeof serviceB).to.be.equal('function');
  });

  it('service has name', () => {
    const serviceA = createService<number>('name1');
    expect(serviceA.name).to.be.equal('name1');
  });

  it('factory overrides name', () => {
    const collection = new ServiceCollection();
    const provider = collection
      .getProvider(pipe => pipe.addMiddleware((descriptor, provider, value) => {
        expect(descriptor.name).to.be.equal('serviceCFunc');
        return value;
      }));

    const serviceC = createService<typeof serviceCFunc>();

    function serviceCFunc(scope: IServiceProvider) {
      return testAValue;
    }

    collection.addFunction(serviceC, serviceCFunc);

    expect(serviceC(provider)).to.be.equal(testAValue);
  });

  it('attaches', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const collection = new ServiceCollection();
    const provider = collection.getProvider();
    collection
      .addObject(serviceA, testAValue)
      .addObject(serviceB, testBValue);


    expect(serviceA(provider)).to.be.equal(testAValue);
    expect(serviceB(provider)).to.be.equal(testBValue);
  });

  it('multiple scopes', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();
    const collection = new ServiceCollection();
    const provider = collection.getProvider();
    const scope = provider.createScope();

    collection
      .addObject(serviceA, testAValue)
      .addObject(serviceB, testBValue, ServiceType.Scoped);


    expect(serviceA(provider)).to.be.equal(testAValue);
    expect(() => serviceB(provider)).to.throw(Error, 'Scope not provided');
    expect(serviceB(scope)).to.be.equal(testBValue);
  });

  it('hierarchical scopes', () => {
    const serviceA = createService<number>();
    const serviceB = createService<number>();

    const collection = new ServiceCollection();
    const collectionB = new ServiceCollection();

    const provider = collection.getProvider();
    const scope = provider.createScope(collectionB);

    collection.addObject(serviceA, testAValue);
    collectionB.addObject(serviceB, testBValue, ServiceType.Scoped);

    expect(serviceA(provider)).to.be.equal(testAValue);
    expect(() => serviceB(provider)).to.throw(Error, 'Service descriptor not found');
    expect(serviceB(scope)).to.be.equal(testBValue);
    expect(serviceA(scope)).to.be.equal(testAValue);
  });

  it('provider container', () => {
    const obj = {};
    const collection = new ServiceCollection();
    const provider = createServiceProviderContainer(obj, collection.getProvider());
    const serviceA = createService<number>();
    const serviceB = createService<number>();

    collection
      .addObject(serviceA, testAValue)
      .addObject(serviceB, testBValue);


    expect(serviceA(provider)).to.be.equal(testAValue);
    expect(serviceB(provider)).to.be.equal(testBValue);
  });

  it('factory', () => {
    let i = 0;
    function factory() {
      i++;
      return i;
    }
    const collection = new ServiceCollection();
    const provider = collection.getProvider();
    const serviceA = createService<typeof factory>();

    collection.addFunction(serviceA, factory);


    expect(serviceA(provider)).to.be.equal(1);
    expect(serviceA(provider)).to.be.equal(2);
    expect(i).to.be.equal(2);
  });

  it('Singleton factory', () => {
    let i = 0;
    function factory() {
      i++;
      return i;
    }
    const collection = new ServiceCollection();
    const provider = collection.getProvider();
    const serviceA = createService<typeof factory>();

    collection.addFunction(serviceA, factory, ServiceType.Singleton);


    expect(serviceA(provider)).to.be.equal(1);
    expect(serviceA(provider)).to.be.equal(1);
    expect(i).to.be.equal(1);
  });

  it('Scope factory', () => {
    let i = 0;
    function factory() {
      i++;
      return i;
    }
    const collection = new ServiceCollection();
    const provider = collection.getProvider();
    const serviceA = createService<typeof factory>();

    collection.addFunction(serviceA, factory, ServiceType.Scoped);

    const scopeA = provider.createScope();
    const scopeB = provider.createScope();

    expect(serviceA(scopeA)).to.be.equal(1);
    expect(serviceA(scopeA)).to.be.equal(1);
    expect(serviceA(scopeB)).to.be.equal(2);
    expect(serviceA(scopeB)).to.be.equal(2);
    expect(serviceA(scopeA)).to.be.equal(1);
    expect(serviceA(scopeA)).to.be.equal(1);
    expect(i).to.be.equal(2);
  });
});

describe('Decorator', () => {
  it('function', () => {
    const testValue = [1, 23];

    class ServiceA {
      a = 1
    }
    const serviceA = createService<ServiceA>();

    class ServiceC {
      b = 23
    }
    const serviceC = createService<ServiceC>();

    @injectable
    class ServiceB {
      @serviceA() a!: ServiceA;
      @serviceC() c!: ServiceC;
    }
    const serviceB = createService<ServiceB>();

    const collection = new ServiceCollection();
    const provider = collection.getProvider();

    collection
      .addClass(serviceA, ServiceA)
      .addClass(serviceB, ServiceB)
      .addClass(serviceC, ServiceC);


    expect([serviceB(provider).a.a, serviceB(provider).c.b]).to.be.deep.equal(testValue);
  });
});
