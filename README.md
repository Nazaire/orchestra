# Orchestra

[![npm version](https://badge.fury.io/js/@nazaire%2Forchestra.svg)](https://badge.fury.io/js/@nazaire%2Forchestra)
![NPM License](https://img.shields.io/npm/l/@nazaire/orchestra)

> This package is in prerelease and is currently unmaintained and unsupported, use at your own risk.

A framework for distributing work over many machines, integrated with Node.js workers to utilise many threads per machine.

```
import { Client } from 'orchestra';

const orchestra = new Client(
    network,
    workspace,
);

console.log(`Creating job...`);

const result = await orchestra.play({ script: 'add.js', params: { a: 1, b: 2 } });

console.log(`Job complete!`, { result });
```

## Installation

Add the npm package to your project:

`npm install @nazaire/orchestra --save`

or

`yarn add @nazaire/orchestra`

## Overview / Setup

On your master machine:

- Create an instance of `Composer`

On every machine that you want to do work on:

- Create an instance of `Instrument`

On any machines that you need to allocate work from:

- Create an instance of `Client`

---

For example, let's take a basic web app.

- Server machine (only one): Has an instance of `Composer` and `Client`
- Worker machine (many): Has an instance of `Instrument`

When a request comes in to the server, it can add a job to the network using the `Client` instance.

The `Composer` will then distribute the job to the `Instrument` on the worker machine.

Alternatively, if you only need one machine:

- Single machine: Has an instance of `Composer`, `Instrument` and `Client`

Or again, if you have multiple servers, you can have the `Composer` exist on a master worker machine:

- Server (many): Has an instance of `Client`
- Master worker (only one): Has an instance of `Composer` ( and `Instrument` if you want work to be done on the master worker too)
- Slave worker (many): Has an instance of `Instrument`

## Components

### Network

Establish a network of machines.
Provided options:

- `MemNetwork` - A network that exists in one process (useful for testing or single machine setups)
- `RedisNetwork` - A network that runs across many machines and uses Redis as a message broker

```
import { Network } from 'orchestra';

const network = new Network.MemNetwork();

// if you are using a network that requires an async connection
// you need to also run network.connect()

// network needs to be passed to all the major components (composer, instrument, client)

```

### Workspace

A workspace is a directory that contains the code that will be run on the workers.
All worker machines need to have access to this directory as they will invoke the scripts directly.

```
import { Workspace } from 'orchestra';

const workspace = new Workspace(
    '/path/to/workspace', // this should be an absolute path, you can use __dirname to get the current directory, or process.cwd() to get the directory the process was started in
);

// the workspace needs to be passed to the client and instrument


```

### Composer

The composer is responsible for managing the queue of work to be done and distributing it to the workers.
There should only be one `Composer` per network.

```

import { Composer } from 'orchestra';

const composer = new Composer(
network,
);

// The composer will start accepting job requests as soon as it's created and will distribute them to the instruments

```

### Instrument

The instrument runs on the main thread of each machine and is responsible for receiving work from the `Composer` and distributing it to it's workers.

```
import { Instrument } from 'orchestra';

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

import { Worker } from 'orchestra';

const worker = new Worker();

const params = worker.params;

console.log(`Doing work...`, { params });

const result = params.a + params.b;

worker.resolve(result);

```

### Client

The Client is an interface that can add work to the network.

```
import { Client } from 'orchestra';

const orchestra = new Client(
    network,
    workspace,
);

console.log(`Creating job...`);

const result = await orchestra.play({ script: 'add.js', params: { a: 1, b: 2 } });

console.log(`Job complete!`, { result });
```

## Typescript

Orchestra supports fully typed job params and results.

```
// define the params and results of each script in a type
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

const orchestra = new Client<typeof Workspace>(
    network,
    workspace,
);

// this method is now fully typed (the params and the result)
const result = await orchestra.play({
    script: 'add.js',
    params: { a: 1, b: 2 } }
) // Promise<number>
```

The Worker class can also be typed.

```
// path/to/workspace/add.js

import { Worker } from 'orchestra';

// import the workspace type from somewhere else in your project
import { workspace }  from '...';

const worker = new Worker<typeof workspace, 'add.js'>();

const params = worker.params; // { a: number, b: number }

const result = params.a + params.b;

// this method is now fully typed and expects a number
worker.resolve(result);
```

# Examples

## Basic Addition (Typescript)

This example uses a worker to perform basic addition.
The directory structure is as follows:

```
- src/
    - server.ts
    - worker.ts
    - orchestra.ts
    - scripts/
       - add.ts
```

### add.ts - the worker script

This script will be invoked within a Node.JS worker process spawned by the `Instrument`.  
Note that this is a `.ts` (typescript) file, but is referenced from the client at runtime as `add.js`.

```
// src/scripts/add.ts

import { Worker } from '@nazaire/orchestra';
import { workspace } from 'src/orchestra.ts';

// we pass the workspace type as a generic param to the Worker class
// this will ensure worker.params and worker.resolve are correctly typed
const worker = new Worker<typeof workspace, 'add.js'>();

worker.resolve(worker.params.a + worker.params.b);

```

### orchestra.ts - shared configuration

This is a common file in your project shared between the worker and the server, it provides an instance of `Network`, `Workspace` and `Client`.

```
// src/orchestra.ts

import { Client, Network, Workspace } from "@nazaire/orchestra";
import { Redis } from "ioredis";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export const network = new Network.RedisNetwork(
  {
    publisher: new Redis(),
    subscriber: new Redis(),
  },
  {
    // debug: true,
  }
);

// here we specify the types of the available scripts in the workspace
export type Scripts = {
  "add.js": {
    params: { a: number, b: number };
    result: number;
  };
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspacePath = join(__dirname, "./scripts");

export const workspace = new Workspace<keyof Scripts, Scripts>(workspacePath);

export const orchestra = new Client(network, workspace);
```

### server.ts - the server process

This is the server process. In this example, it's simply setting up the `Composer` and adding a new job to the network every 2 seconds.

```
// src/server.ts

import { Composer } from "@nazaire/orchestra";
import { orchestra } from 'src/orchestra.js';

console.log(`Starting server...`);

await network.connect();

new Composer(network, {
    // debug: true,
});


console.log("Orchestra ready!");

setInterval(() => {
    const job = await orchestra.queue({
        script: "add.js",
        params: { a: 1, b: 2},
    });

    console.log("Added job to queue", job);

    try {
        // result() returns a Promise that will resolve with the result once the job is complete
        const value = await orchestra.result(job);

        console.log("Job succeeded", value);
    } catch (error) {
        console.error("Job failed", error);
    }
}, 2_000);

```

### worker.ts - the worker process

This is the workers entry point. It sets up a `Instrument` that performs work as instructed from the `Composer`.

```
// src/worker.ts

import { network, workspace } from 'src/orchestra.js';

console.log(`Starting worker...`);

await network.connect();

console.log("Orchestra ready!");

new Instrument(
    network,
    workspace,
    1, // the number of workers to run on this machine (usually the number of cores available)
    {
        debug: true,
    }
);

// the Instrument will now spawn workers when it receives work
```

### Conclusion

Once you've built the source code.

You can start the server with `node dist/server.js`,  
and you can start a worker process with `node dist/worker.js`.

In this example, there should only ever be ONE process of the server (as the server houses the `Composer` instance)
and you can spawn as many worker processes as you need.

Adjust the max worker count in the `Instrument` arguments to utilise as many threads as suitable for the machine the process is running on.
