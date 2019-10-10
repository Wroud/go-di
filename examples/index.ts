const createStore: any = undefined

import { withScope, createService } from '../src'

const reduxStore = createStore()
const [store, scope] = withScope(reduxStore)

const fetchService = createService<typeof fetch>()
const logService = createService<(message: string) => void>()

scope.attach(fetchService, fetch)
scope.attach(logService, (message: string) => console.log(message))

async function myFunction(store) {
    const fetch = fetchService(store)
    const logger = logService(store)

    const data = await fetch('/')
    logger(data.statusText)
}

myFunction(store)

serviceA(a =>
    serviceB(b =>
        (obj, c, d) => (obj.field = a + b + c + d)
    )
)(obj, 3, 4);

function fn(obj, c, d){
    const a = serviceA(obj)
    const b = serviceB(obj)
    obj.field = a + b + c + d
}

