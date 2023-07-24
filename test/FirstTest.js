import { expect } from 'chai';
import path from 'path';
import { Composer, Consumer, Instrument, Network, Workspace } from '../dist/index.js';

describe('My First Test', () => {

    let network, workspace, composer, instrument, consumer;

    it('Creates workspace', () => {
        workspace = new Workspace(path.resolve(process.cwd(), './test/workers'))
        expect(workspace).to.be.an('object')
    })


    it('Creates network', () => {
        network = new Network.MemNetwork({
            debug: true
        })
        expect(network.connected).to.equal(true)
    })

    it('Creates composer', () => {
        composer = new Composer(network)
    })

    it('Creates instrument', () => {
        instrument = new Instrument(network, workspace, 1)
    })

    it('Creates consumer', () => {
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