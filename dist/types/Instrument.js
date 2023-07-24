import { nanoid } from "nanoid";
import { NetworkClient, MessageType, } from "./Network/index.js";
import { Worker } from "worker_threads";
import { WorkerMessageType } from "./Worker/WorkerMessage.js";
export class Instrument extends NetworkClient {
    workspace;
    workers;
    constructor(network, workspace, workers) {
        super("instrument_" + nanoid(), network);
        this.workspace = workspace;
        this.workers = workers;
        this.on(MessageType.JOB_AVAILABLE, this.handleJobAvailable.bind(this));
    }
    activeJobs = new Map();
    async handleJobAvailable(msg) {
        if (this.activeJobs.size >= this.workers) {
            return;
        }
        const workRequest = this.createResponseTo(msg, {
            type: MessageType.JOB_REQUEST,
            data: null,
        });
        console.log("Sending work request:", workRequest);
        const response = await this.sendAndAwaitResponse(workRequest);
        if (response.data === null) {
            // No work available.
            return;
        }
        else {
            // create a worker
            this.startWorker(response.data);
        }
    }
    async startWorker(job) {
        console.log("Starting worker for job:", job);
        const complete = async (result, error) => {
            const message = this.createMessage({
                type: MessageType.JOB_COMPLETED,
                destination: "*",
                data: {
                    ...job,
                    status: "completed",
                    result,
                    error,
                },
            });
            await this.send(message);
            this.activeJobs.delete(job.id);
        };
        try {
            const worker = new Worker(this.workspace.getPath(String(job.options.script)), {
                workerData: {
                    params: job.options.params,
                },
            });
            this.activeJobs.set(job.id, worker);
            const complete = async (result, error) => {
                if (this.activeJobs.get(job.id) !== worker) {
                    return;
                }
                const message = this.createMessage({
                    type: MessageType.JOB_COMPLETED,
                    destination: "*",
                    data: {
                        ...job,
                        status: "completed",
                        result,
                        error,
                    },
                });
                await this.send(message);
                this.activeJobs.delete(job.id);
            };
            // node.js worker bindings
            worker.on("message", (message) => {
                if (message.type === WorkerMessageType.WORK_RESULT) {
                    complete(message.data.result, message.data.error);
                    worker.terminate();
                }
            });
            worker.on("error", (error) => {
                complete(null, [error.message, error.stack].filter(Boolean).join("\n"));
            });
            worker.on("exit", (code) => {
                console.log("worker exit", { code });
                if (code === 0) {
                    complete(null, null);
                }
                else {
                    complete(null, String(new Error("Worker exited with code " + code)));
                }
            });
        }
        catch (error) {
            console.log("error", error);
            complete(null, String(error));
        }
    }
}
//# sourceMappingURL=Instrument.js.map