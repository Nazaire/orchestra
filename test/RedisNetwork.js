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

        composer = new Composer(network)

        instrument = new Instrument(network, workspace, 1)

        consumer = new Consumer(network, workspace)
    })


    it('Adds a job', async () => {
        const job = await consumer.addJob({
            script: 'test.worker.js',
            params: { test: 123 }
        });

        console.log(`Added a job with id ${job.job.id}`)

        const result = await job.result;

        console.log(`Job ${job.job.id} finished with result ${result}`)

        // result should not be null
        expect(result).to.not.be.null;
    })

}
)