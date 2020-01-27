# go-di - Dependency injection in JavaScript

[![GitHub issues](https://img.shields.io/github/issues/Wroud/go-di.svg)](https://github.com/Wroud/go-di/issues)
[![GitHub license](https://img.shields.io/github/license/Wroud/go-di.svg)](https://github.com/Wroud/go-di/blob/master/LICENSE)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/go-di)](https://bundlephobia.com/result?p=go-di)
[![npm version](https://img.shields.io/npm/v/go-di.svg)](https://www.npmjs.com/package/go-di)
[![npm downloads](https://img.shields.io/npm/dm/go-di.svg)](https://www.npmjs.com/package/go-di)

## Install

```
npm i go-di
```

## Supports

- ## Service types
  - Class
  - Object
  - Factory
- ## Service lifetimes
  - Singleton
  - Transient
  - Scoped
- ## Decorators
  - `@injectable` for class
  - `@serviceName` for property
- ## Misc
  - Middleware for service initialization

## Usage

### Decorators

```js
import { injectable, createService, ServiceCollection } from "go-di";

const collection = new ServiceCollection();
const provider = collection.getProvider();

class ServiceA {
  a = 1
}
const serviceA = createService<ServiceA>();

@injectable
class ServiceB {
  @serviceA() a!: ServiceA;
}
const serviceB = createService<ServiceB>();

collection
  .addClass(serviceA, ServiceA)
  .addClass(serviceB, ServiceB);

console.log(serviceB(provider).a.a);
// 1
```

### Lifetime

```js
import { createService, ServiceCollection } from "go-di";

const collection = new ServiceCollection();
const provider = collection.getProvider();

const serviceA = createService<typeof myServiceA>();
const serviceB = createService<typeof myServiceB>();
const serviceС = createService<typeof myServiceC>();

let serviceACounter = 0;
function myServiceA() {
  return serviceACounter++;
}

let serviceBCounter = 0;
function myServiceB() {
  return serviceBCounter++;
}

let serviceCCounter = 0;
function myServiceC() {
  return serviceCCounter++;
}

collection
  .addFunction(serviceA, myServiceA, ServiceType.Transient)
  .addFunction(serviceB, myServiceB, ServiceType.Singleton)
  .addFunction(serviceС, myServiceC, ServiceType.Scoped);

console.log(serviceA(provider), serviceACounter) // 0, 1
console.log(serviceA(provider), serviceACounter) // 1, 2

console.log(serviceB(provider), serviceBCounter) // 0, 1
console.log(serviceB(provider), serviceBCounter) // 0, 1

console.log(serviceC(provider), serviceCCounter) // throws error

const scopeA = provider.createScope();
console.log(serviceC(scopeA), serviceCCounter) // 0, 1
console.log(serviceC(scopeA), serviceCCounter) // 0, 1

const scopeB = provider.createScope();
console.log(serviceC(scopeB), serviceCCounter) // 1, 2
console.log(serviceC(scopeB), serviceCCounter) // 1, 2

console.log(serviceC(scopeA), serviceCCounter) // 0, 2
console.log(serviceC(scopeB), serviceCCounter) // 1, 2
```

### Hierarchical scope

```js
import { createService, ServiceCollection } from "go-di";

const collection = new ServiceCollection();
const secondCollection = new ServiceCollection();
const provider = collection.getProvider();
const scope = provider.createScope(secondCollection);

const serviceA = createService<typeof myServiceA>();
const serviceB = createService<typeof myServiceB>();
const serviceС = createService<typeof myServiceC>();

let serviceACounter = 0;
function myServiceA() {
  return serviceACounter++;
}

let serviceBCounter = 0;
function myServiceB() {
  return serviceBCounter++;
}

let serviceCCounter = 0;
function myServiceC() {
  return serviceCCounter++;
}

collection
  .addFunction(serviceA, myServiceA, ServiceType.Transient)
  .addFunction(serviceB, myServiceB, ServiceType.Singleton);

secondCollection.addFunction(serviceС, myServiceC, ServiceType.Scoped);

console.log(serviceA(provider), serviceACounter) // 0, 1
console.log(serviceA(provider), serviceACounter) // 1, 2

console.log(serviceB(provider), serviceBCounter) // 0, 1
console.log(serviceB(provider), serviceBCounter) // 0, 1

console.log(serviceC(provider), serviceCCounter) // throws error

console.log(serviceC(scope), serviceCCounter) // 0, 1
console.log(serviceC(scope), serviceCCounter) // 0, 1

console.log(serviceA(scope), serviceACounter) // 0, 2
console.log(serviceA(scope), serviceACounter) // 1, 2

console.log(serviceB(scope), serviceBCounter) // 0, 1
console.log(serviceB(scope), serviceBCounter) // 0, 1
```

### useMiddleware
```js
import { createService, ServiceCollection } from "go-di";

const collection = new ServiceCollection();
const provider = collection
  .getProvider(pipe => pipe.addMiddleware((descriptor, provider, value, args)=> {
    function getValue(descriptor, args) {
      const _value = value(descriptor, args);
      console.log(`${descriptor.name}(${args}) => ${_value}`)
    }
    return getValue;
  }));

const serviceA = createService<number>('serviceA');
const serviceB = createService<number>('serviceB');
const serviceС = createService<typeof myService>();

function myService(arg) {}

collection
  .addObject(serviceA, 1)
  .addObject(serviceB, 2)
  .addFunction(serviceС, myService);

serviceA(provider);
// serviceA([]) => 1

serviceB(provider);
// serviceB([]) => 2

serviceC(provider, "argument");
// myService(["argument"]) => undefined
```
