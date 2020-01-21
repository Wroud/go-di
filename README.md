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
- ## Decorators
  - `@injectable` for class
  - `@serviceName` for property
- ## Misc
  - Short call for functions
  - Middleware for service initialization

## Usage

### Decorators

```js
import { injectable, createService, withScope } from "go-di";

const objToAttach = {};
const [obj, scope] = withScope(objToAttach);

class ServiceA {
  a = 1
}
const serviceA = createService<ServiceA>();

@injectable
class ServiceB {
  @serviceA a!: ServiceA;
}
const serviceB = createService<ServiceB>();

scope.attachClass(serviceA, ServiceA);
scope.attachClass(serviceB, ServiceB);

console.log(serviceB(obj).a.a);
// 1
```

### Independent

```js
import { createIService, createScope } from "go-di";

const service = createIService();
const scope = createScope().attach(service, 1);

console.log(service(scope));
// 1
```

### withScope

```js
import { createService, withScope } from "go-di";

const objToAttach = {};
const [obj, scope] = withScope(objToAttach);
const serviceA = createService();
const serviceB = createService();

scope.attach(serviceA, 1);
scope.attach(serviceB, 2);

console.log(serviceA(obj));
// 1
console.log(serviceA(scope));
// 1

serviceA(a => serviceB(b => (obj, c, d) => (obj.field = a + b + c + d)))(
  obj,
  3,
  4
);
// obj.field = a + b + c + d
// obj.field = 1 + 2 + 3 + 4

console.log(obj.field);
// 10
```

### attachFactory Transient

```js
import { createService, withScope } from "go-di";

const objToAttach = {};
const [obj, scope] = withScope(objToAttach);
const serviceA = createService();
const serviceB = createService();
const serviceC = createService();

function myFactory(scope){
  return serviceA(scope) + serviceB(scope);
}

scope.attach(serviceA, 1);
scope.attach(serviceB, 2);
scope.attachFactory(serviceC, myFactory);

console.log(serviceC(scope));
// 3

serviceA(a =>
  serviceB(b =>
    serviceC(c =>
      (obj, e, d) => (obj.field = a + b + c + d + e)
  )
)(obj, 3, 4);
// obj.field = a + b + c + d + e
// obj.field = 1 + 2 + 3 + 4 + 3

console.log(obj.field)
// 13
```

### attachFactory Singleton

```js
import { createService, withScope } from "go-di";

const objToAttach = {};
const [obj, scope] = withScope(objToAttach);
const serviceA = createService();
const serviceB = createService();
const serviceC = createService();

function myFactory(scope) {
  console.log("myFactory initialized");
  return serviceA(scope) + serviceB(scope);
}

scope.attach(serviceA, 1);
scope.attach(serviceB, 2);
scope.attachFactory(serviceC, myFactory, true); // here true is flag thats we use for Singleton

console.log(serviceC(scope));
// myFactory initialized
// 3

console.log(serviceC(scope));
// 3
/* Message "myFactory initialized" isn't print to console second time */
```

### Advanced

```js
import { createIService, createScope } from "go-di";

const serviceA = createIService<number>();
const serviceB = createIService<number>();

const scopeFirst = createScope();
const scopeSecond = createScope();

scopeFirst
  .attach(serviceA, 1)
  .attach(serviceB, 2);

console.log(scopeFirst.provide(() =>
  serviceA(a =>
    serviceB(b => a + b)
)));
// 3

scopeSecond
  .attach(serviceB, 44);

console.log(scopeFirst.provide(() =>
  serviceA(a =>
    scopeSecond.provide(() => serviceB(b => a + b))
)));
// 45
```

### useMiddleware
```js
const scope = createScope();

const serviceA = createIService<number>('serviceA');
const serviceB = createIService<number>('serviceB');
const serviceС = createIService<typeof myService>();

function myService(arg) {}

scope
  .useMiddleware((service, params, value) => {
    const _value = value(service, params);
    console.log(`${service.getName()}(${params}) => ${_value}`)
    return _value;
  })
  .attach(serviceA, 1)
  .attach(serviceB, 2)
  .attach(serviceС, myService);

serviceA(scope);
// serviceA([]) => 1

serviceB(scope);
// serviceB([]) => 2

serviceC(scope, "argument");
// myService(["argument"]) => undefined
```
