# Orchestra

A framework for distributing work over many machines, integrated with Node.js workers to utilise many threads per machine.

## Overview / Setup

On your master machine:

- Create an instance of `Composer`

On every machine that you want to do work on:

- Create an instance of `Instrument`

On any machines that you need to allocate work from:

- Create an instance of `Consumer`

---

For example, let's take a basic web app.

- Server machine (only one): Has an instance of `Composer` and `Consumer`
- Worker machine (many): Has an instance of `Instrument`

When a request comes in to the server, it can add a job to the network using the `Consumer` instance.

The `Composer` will then distribute the job to the `Instrument` on the worker machine.

Alternatively, if you only need one machine:

- Single machine: Has an instance of `Composer`, `Instrument` and `Consumer`

Or again, if you have multiple servers, you can have the `Composer` exist on a master worker machine:

- Server (many): Has an instance of `Consumer`
- Master worker (only one): Has an instance of `Composer` ( and `Instrument` if you want work to be done on the master worker too)
- Slave worker (many): Has an instance of `Instrument`

## Components

### Network

Establish a network of machines.
Provided options:

- `MemNetwork` - A network that exists in one process (useful for testing or single machine setups)
- `RedisNetwork` - A network that runs across many machines and uses Redis as a message broker

```
const { MemNetwork } = require('orchestra');

const network = new MemNetwork();

// network needs to be passed to all the major components (composer, instrument, consumer)

```

### Workspace

A workspace is a directory that contains the code that will be run on the workers.
All worker machines need to have access to this directory as they will invoke the scripts directly.

```
const { Workspace } = require('orchestra');

const workspace = new Workspace(
    '/path/to/workspace', // this should be an absolute path, you can use __dirname to get the current directory, or process.cwd() to get the directory the process was started in
);

// the workspace needs to be passed to the consumer and instrument


```

### Composer

The composer is responsible for managing the queue of work to be done and distributing it to the workers.
There should only be one `Composer` per network.

```

const { Composer } = require('orchestra');

const composer = new Composer(
network,
);

// The composer will start accepting job requests as soon as it's created and will distribute them to the instruments

```

### Instrument

The instrument runs on the main thread of each machine and is responsible for receiving work from the `Composer` and distributing it to it's workers.

```

const { Instrument } = require('orchestra');

const instrument = new Instrument(
network,
workspace,
4 // max number of workers (usually just the number of cores on the machine)
);

// there's nothing to do here, the instrument will start working as soon as it's created
// it listens for work from the Composer and spawns Workers to do the work

```

### Worker

This is a helper class that should be used within the worker script to retrieve the params and notify the instrument when the work is complete.

```

const { Worker } = require('orchestra');

const worker = new Worker();

const params = worker.params;

console.log(`Doing work...`, { params });

const result = params.a + params.b;

worker.resolve(result);

```

### Consumer

The consumer is an interface that can add work to the network.

```
const { Consumer, Network, Workspace } = require('orchestra');

const consumer = new Consumer(
    new Network(),
    new Workspace('/path/to/workspace'),
);

const { job, result } = await consumer.addJob('add.js', { a: 1, b: 2 });

console.log(`Created job`, { job });
console.log('Waiting for completion...')
console.log(`Result:`, await result)
```

## Typescript

Orchestra supports fully typed job params and results.

```
type MyScripts = {
    'add.js': {
       params: {
        a: number;
        b: number;
       },
       result: number;
    };
}

const workspace = new Workspace<keyof MyScripts, MyScripts>(
    '/path/to/workspace',
);

const consumer = new Consumer<typeof Workspace>(
    new Network(),
    workspace,
);

// this method is now fully typed (the params and the result)
const {job, result} = await consumer.addJob('add.js', { a: 1, b: 2 }) // { job: Job, result: Promise<number> }
```

The Worker class can also be typed.

```
// path/to/workspace/add.js

const { Worker } = require('orchestra');

// import the workspace instance from somewhere else in your project
const { workspace }  = require('...');

const worker = new Worker<typeof workspace, 'add.js'>();

const params = worker.params; // { a: number, b: number }

const result = params.a + params.b;

// this method is now fully typed and expects a number
worker.resolve(result);
```
