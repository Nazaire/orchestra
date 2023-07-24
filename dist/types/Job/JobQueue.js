import { nanoid } from "nanoid";
export class JobQueue {
    queue = [];
    jobs = {};
    get size() {
        return this.queue.length;
    }
    createJob(options) {
        const job = {
            id: nanoid(),
            status: "waiting",
            options,
            result: null,
            error: null,
        };
        this.addJob(job);
        return job;
    }
    async addJob(job) {
        this.jobs[job.id] = {
            ...job,
            status: "waiting",
        };
        this.queue.push(job.id);
        return job;
    }
    /**
     *
     * @returns The next job in the queue, or null if there are no jobs.
     */
    next() {
        return this.queue[0];
    }
    updateJob(id, data) {
        Object.assign(this.jobs[id], data);
        return this.jobs[id];
    }
    start(id) {
        const index = this.queue.findIndex((j) => j === id);
        if (index === -1) {
            throw new Error("Job not found");
        }
        else {
            this.queue.splice(index, 1);
        }
        return this.updateJob(id, { status: "active" });
    }
    complete(id, result, error) {
        return this.updateJob(id, { status: "completed", result, error });
    }
    getJobs() {
        return Object.values(this.jobs);
    }
}
//# sourceMappingURL=JobQueue.js.map