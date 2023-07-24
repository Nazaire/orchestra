import { MessageType } from "./Network/index.js";
import { NetworkClient } from "./Network/NetworkClient.js";
export class Consumer extends NetworkClient {
    workspace;
    constructor(network, workspace) {
        super("consumer_" + Math.random(), network);
        this.workspace = workspace;
    }
    /**
     * Public API with strict types
     * @param options
     * @returns
     */
    async addJob(options) {
        const job = await this.createJob(options);
        return {
            job,
            result: this.getJobResultPromise(job.id),
        };
    }
    async bulkAddJobs(options) {
        const jobs = await Promise.all(options.map((o) => this.createJob(o)));
        return jobs.map((job) => ({
            job,
            result: this.getJobResultPromise(job.id),
        }));
    }
    async runJob(options) {
        let job = await this.createJob(options);
        return this.getJobResultPromise(job.id);
    }
    async runJobs(options) {
        const jobs = await Promise.all(options.map((o) => this.createJob(o)));
        return Promise.all(jobs.map((job) => this.getJobResultPromise(job.id)));
    }
    async getJob(id) {
        const message = this.createMessage({
            type: MessageType.QUERY_JOBS,
            destination: "*",
            data: { id },
        });
        const response = await this.sendAndAwaitResponse(message);
        return response.data;
    }
    async createJob(options) {
        const message = this.createMessage({
            type: MessageType.CREATE_JOB,
            destination: "*",
            data: options,
        });
        const response = await this.sendAndAwaitResponse(message);
        return response.data;
    }
    async getJobCompletedPromise(jobId) {
        const completedMessage = this.network.first((m) => m.type === MessageType.JOB_COMPLETED &&
            m.data.id === jobId);
        return completedMessage.then((value) => value.data);
    }
    getJobResultPromise(jobId) {
        const completed = this.getJobCompletedPromise(jobId);
        return completed.then((job) => {
            if (job.error) {
                throw new Error(job.error);
            }
            else {
                return job.result;
            }
        });
    }
}
//# sourceMappingURL=Consumer.js.map