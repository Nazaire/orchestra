import { expect } from 'chai';
import path from 'path';
import { Composer, Client, Instrument, Network, Workspace } from '../dist/index.js';
import { Redis } from 'ioredis'

describe('Redis Network', () => {

    let network, workspace, composer, instrument, orchestra;

    it('Initialises', async () => {
        workspace = new Workspace(path.resolve(process.cwd(), './test/workers'))
        expect(workspace).to.be.an('object')

        network = new Network.RedisNetwork(
            () => new Redis(),
            {
                debug: true
            })

        await network.connect();

        expect(network.connected).to.equal(true)

        composer = new Composer(network, {
            debug: true
        })

        instrument = new Instrument(network, workspace, 1, {
            debug: true
        })

        orchestra = new Client(network, workspace)
    })


    it('Adds a job', async () => {
        const job = await orchestra.queue({
            script: 'add.worker.js',
            params: { a: 5, b: 6 }
        });

        console.log(`Added a job with id ${job.id}`)

        const result = await orchestra.result(job.id);

        console.log(`Job ${job.id} finished with result ${result}`)

        expect(result).to.equal(11)
    })

    // it('Adds a job (slow)', async () => {
    //     const job = await consumer.addJob({
    //         script: 'slowAdd.worker.js',
    //         params: { a: 5, b: 6 }
    //     });

    //     console.log(`Added a job with id ${job.job.id}`)

    //     const result = await job.result;

    //     console.log(`Job ${job.job.id} finished with result ${result}`)

    //     expect(result).to.equal(11)
    // })

    it(`Handles errors`, async () => {
        let job = await orchestra.queue({
            script: 'error.worker.js',
            params: {}
        });

        console.log(`Added a job with id ${job.id}`)

        const result = await orchestra.result(job.id).catch(err => err);

        console.log(`Job ${job.id} finished with result ${result}`)

        expect(result).to.be.an('error')
    })

    it(`Handles streams`, async () => {
        let job = await orchestra.queue({
            script: 'stream.worker.js',
            params: {}
        });

        console.log(`Added a job with id ${job.id}`)

        const stream = await orchestra.stream(job.id);

        stream.on('data', (data) => {
            console.log(`Job ${job.id} stream data: x: ${data.x}, sum: ${data.sum}`)
        })

        const result = await orchestra.result(job.id);

        console.log(`Job ${job.id} finished with result ${result}`)

    })

}
)