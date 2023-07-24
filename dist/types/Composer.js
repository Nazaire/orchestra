import { nanoid } from "nanoid";
import { MessageType, NetworkClient, } from "./Network/index.js";
import { JobQueue } from "./Job/JobQueue.js";
export class Composer extends NetworkClient {
    id = "composer_" + nanoid();
    queue = new JobQueue();
    constructor(network) {
        super("composer_" + nanoid(), network);
        this.on(MessageType.CREATE_JOB, this.onCreateJobMessage.bind(this));
        this.on(MessageType.QUERY_JOBS, this.onQueryJobsMessage.bind(this));
        this.on(MessageType.JOB_REQUEST, this.onJobRequestMessage.bind(this));
        this.on(MessageType.JOB_COMPLETED, this.onJobCompletedMessage.bind(this));
    }
    async onQueryJobsMessage(msg) {
        const jobs = this.queue.getJobs().filter((job) => {
            if (msg.data.id) {
                return job.id === msg.data.id;
            }
            if (msg.data.status) {
                return job.status === msg.data.status;
            }
            return true;
        });
        const response = this.createResponseTo(msg, {
            type: MessageType.QUERY_JOBS_RESPONSE,
            data: jobs,
        });
        await this.send(response);
    }
    async onCreateJobMessage(msg) {
        const job = this.queue.createJob(msg.data);
        const response = this.createResponseTo(msg, {
            type: MessageType.CREATE_JOB_RESPONSE,
            data: job,
        });
        await this.send(response);
        this.notifyWorkersIfAvailableWork();
    }
    async notifyWorkersIfAvailableWork() {
        if (this.queue.size > 0) {
            // notify workers of work
            const message = this.createMessage({
                type: MessageType.JOB_AVAILABLE,
                destination: "*",
                data: null,
            });
            await this.send(message);
        }
    }
    async onJobRequestMessage(msg) {
        const jobId = this.queue.next();
        let job = null;
        if (jobId)
            job = this.queue.start(jobId);
        const response = this.createResponseTo(msg, {
            type: MessageType.JOB_RESPONSE,
            data: job,
        });
        await this.send(response);
    }
    async onJobCompletedMessage(msg) {
        const job = this.queue.complete(msg.data.id, msg.data.result, msg.data.error || null);
        this.notifyWorkersIfAvailableWork();
    }
}
//# sourceMappingURL=Composer.js.map