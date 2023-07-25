import { expect } from 'chai';
import path from 'path';
import { Composer, Consumer, Instrument, Network, Workspace } from '../dist/index.js';
import { Redis } from 'ioredis'

describe('Redis Network', () => {

    let network, workspace, composer, instrument, consumer;

    it('Initialises', async () => {
        workspace = new Workspace(path.resolve(process.cwd(), './test/workers'))
        expect(workspace).to.be.an('object')

        network = new Network.RedisNetwork({
            publisher: new Redis(),
            subscriber: new Redis(),
        }, {
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

        consumer = new Consumer(network, workspace)
    })


    it('Adds a job', async () => {
        const job = await consumer.addJob({
            script: 'add.worker.js',
            params: { a: 5, b: 6 }
        });

        console.log(`Added a job with id ${job.job.id}`)

        const result = await job.result;

        console.log(`Job ${job.job.id} finished with result ${result}`)

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
        let job = await consumer.addJob({
            script: 'error.worker.js',
            params: {}
        });

        console.log(`Added a job with id ${job.job.id}`)

        const result = await job.result.catch(err => err);

        console.log(`Job ${job.job.id} finished with result ${result}`)

        expect(result).to.be.an('error')
    })

}
)