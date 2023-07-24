import { Job } from "./Job.js";
export declare class JobQueue {
    queue: string[];
    jobs: {
        [id: string]: Job;
    };
    get size(): number;
    createJob(options: Job["options"]): Job;
    addJob(job: Job): Promise<Job>;
    /**
     *
     * @returns The next job in the queue, or null if there are no jobs.
     */
    next(): string;
    updateJob(id: string, data: Partial<Job>): Job;
    start(id: string): Job;
    complete(id: string, result: any, error: string | null): Job;
    getJobs(): Job[];
}
//# sourceMappingURL=JobQueue.d.ts.map