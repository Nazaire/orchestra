import { Worker } from '../../dist/index.js'

const worker = new Worker();

const params = worker.params;

setTimeout(() => {
    worker.resolve(params.a + params.b)
}, 10_000)