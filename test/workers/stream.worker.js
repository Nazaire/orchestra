import { Worker } from '../../dist/index.js'

const worker = new Worker();

let sum = 0;

await new Promise((resolve) => {
    const interval = setInterval(() => {
        const x = Math.random();
        sum += x;
        worker.write({ x: x, sum })
    }, 1_000)

    setTimeout(() => {
        clearInterval(interval)
        resolve()
    }, 10_000)
});

worker.return(sum)