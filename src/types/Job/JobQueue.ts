import { nanoid } from "nanoid";
import { Job } from "./Job.js";

export class JobQueue {
  queue: string[] = [];
  jobs: { [id: string]: Job } = {};

  get size() {
    return this.queue.length;
  }

  public createJob(options: Job["options"], priority: Job["priority"]) {
    const job: Job = {
      id: nanoid(),
      status: "waiting",
      options,
      priority,
      result: null,
      error: null,
    };
    this.addJob(job);
    return job;
  }

  public async addJob(job: Job) {
    this.jobs[job.id] = {
      ...job,
      status: "waiting",
    };
    this.queue.push(job.id);
    this.queue.sort((a, b) => {
      return this.jobs[a].priority - this.jobs[b].priority;
    });
    return job;
  }

  public indexOf(id: string) {
    return this.queue.findIndex((j) => j === id);
  }

  public getValues() {
    return this.queue.map((id) => this.jobs[id]);
  }

  /**
   *
   * @returns The next job in the queue, or null if there are no jobs.
   */
  public next() {
    return this.queue[0];
  }

  public updateJob(id: string, data: Partial<Job>) {
    Object.assign(this.jobs[id], data);
    return this.jobs[id];
  }

  public start(id: string) {
    const index = this.queue.findIndex((j) => j === id);

    if (index === -1) {
      throw new Error("Job not found");
    } else {
      this.queue.splice(index, 1);
    }

    return this.updateJob(id, { status: "active" });
  }

  public complete(id: string, result: any, error: string | null) {
    return this.updateJob(id, { status: "completed", result, error });
  }

  public getJobs() {
    return Object.values(this.jobs);
  }
}
