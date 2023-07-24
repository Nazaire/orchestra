import { Job, JobOptions, StrictJobOptions } from "./Job/Job.js";
import { MemNetwork, MessageType, StrictMessage } from "./Network/index.js";
import { Network } from "./Network/Network.js";
import { NetworkClient } from "./Network/NetworkClient.js";
import { Workspace, WorkspaceResult, WorkspaceScript } from "./Workspace.js";

export interface AddJobResult {
  job: Job;
  result: Promise<any>;
}

export interface StrictAddJobResult<
  W extends Workspace<any, any>,
  S extends WorkspaceScript<W>
> {
  job: Job;
  result: Promise<WorkspaceResult<W, S>>;
}

export class Consumer<W extends Workspace<any, any>> extends NetworkClient {
  constructor(network: Network, private readonly workspace: W) {
    super("consumer_" + Math.random(), network);
  }

  /**
   * Public API with strict types
   * @param options
   * @returns
   */
  async addJob<S extends WorkspaceScript<W>>(
    options: StrictJobOptions<W, S>
  ): Promise<StrictAddJobResult<W, S>> {
    const job = await this.createJob(options);
    return {
      job,
      result: this.getJobResultPromise(job.id),
    };
  }

  async bulkAddJobs<S extends WorkspaceScript<W>>(
    options: StrictJobOptions<W, S>[]
  ): Promise<StrictAddJobResult<W, S>[]> {
    const jobs = await Promise.all(options.map((o) => this.createJob(o)));
    return jobs.map((job) => ({
      job,
      result: this.getJobResultPromise(job.id),
    }));
  }

  async runJob<S extends WorkspaceScript<W>>(
    options: StrictJobOptions<W, S>
  ): Promise<WorkspaceResult<W, S>> {
    let job = await this.createJob(options);
    return this.getJobResultPromise(job.id);
  }

  async runJobs<S extends WorkspaceScript<W>>(
    options: StrictJobOptions<W, S>[]
  ): Promise<WorkspaceResult<W, S>[]> {
    const jobs = await Promise.all(options.map((o) => this.createJob(o)));
    return Promise.all(jobs.map((job) => this.getJobResultPromise(job.id)));
  }

  async getJob(id: string): Promise<Job[]> {
    const message = this.createMessage({
      type: MessageType.QUERY_JOBS,
      destination: "*",
      data: { id },
    });

    const response =
      await this.sendAndAwaitResponse<MessageType.QUERY_JOBS_RESPONSE>(message);

    return response.data;
  }

  private async createJob(options: JobOptions) {
    const message = this.createMessage({
      type: MessageType.CREATE_JOB,
      destination: "*",
      data: options,
    });
    const response =
      await this.sendAndAwaitResponse<MessageType.CREATE_JOB_RESPONSE>(message);
    return response.data;
  }

  private async getJobCompletedPromise(jobId: string) {
    const completedMessage = this.network.first(
      (m) =>
        m.type === MessageType.JOB_COMPLETED &&
        (m as StrictMessage<MessageType.JOB_COMPLETED>).data.id === jobId
    );

    return completedMessage.then((value) => value.data as Job);
  }

  private getJobResultPromise(jobId: string) {
    const completed = this.getJobCompletedPromise(jobId);
    return completed.then((job) => {
      if (job.error) {
        throw new Error(job.error);
      } else {
        return job.result;
      }
    });
  }
}
