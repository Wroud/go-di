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

## Usage
### Simple
```js
import { createIService, createScope } from "go-di";

const service = createIService();
const scope = createScope()
  .attach(service, 1);

console.log(service(scope));
// 1
```

### withScope
```js
import { createService, withScope } from "go-di";

const objToAttach = {};
const [obj, scope] = withScope(objToAttach);
const service = createService();

scope.attach(service, 1);

console.log(service(obj));
// 1
console.log(service(scope));
// 1
```

### Full
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
  serviceA((a = 0) =>
    serviceB((b = 0) => a + b)
)));
// 3

scopeSecond
  .attach(serviceB, 44);

console.log(scopeFirst.provide(() =>
  serviceA((a = 0) =>
    scopeSecond.provide(() => serviceB((b = 0) => a + b))
)));
// 45
```

