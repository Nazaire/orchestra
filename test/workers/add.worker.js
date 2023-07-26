import { Worker } from '../../dist/index.js'

const worker = new Worker();

const params = worker.params;

console.log("Hello from test worker!", { params })

worker.return(params.a + params.b)