import { nanoid } from "nanoid";
import { Job, JobOptions, StrictJobOptions } from "./Job/Job.js";
import { MemNetwork, MessageType, StrictMessage } from "./Network/index.js";
import { Network } from "./Network/Network.js";
import { NetworkClient } from "./Network/NetworkClient.js";
import { Workspace, WorkspaceResult, WorkspaceScript } from "./Workspace.js";
import { Readable, Transform, Writable } from "node:stream";

export class Client<W extends Workspace<any, any>> extends NetworkClient {
  constructor(network: Network, private readonly workspace: W) {
    super("client_" + nanoid(), network);
  }

  /**
   * Add a job to the composer's queue
   * @param options
   * @returns
   */
  async queue<S extends WorkspaceScript<W>>(
    options: StrictJobOptions<W, S>
  ): Promise<Job> {
    return await this.createJob(options);
  }

  /**
   * Add a job and bypass the queue, returns the result once the job is complete
   * @param options
   * @returns the result of the job
   */
  async play<S extends WorkspaceScript<W>>(
    options: StrictJobOptions<W, S>,
    onData?: (data: any) => void
  ): Promise<WorkspaceResult<W, S>> {
    const job = await this.createJob(options, 1);
    if (onData) {
      const stream = await this.stream(job.id);
      stream.on("data", onData);
    }
    return this.getJobResultPromise(job.id);
  }

  /**
   * Return a promise that resolves with the job when it is complete
   * @param jobId
   * @returns
   */
  async completion(jobId: string): Promise<Job> {
    return this.getJobCompletedPromise(jobId);
  }

  /**
   * Return a promise that resolves with the result when the job is complete
   */
  async result<S extends WorkspaceScript<W>>(
    jobId: string
  ): Promise<WorkspaceResult<W, S>> {
    return this.getJobResultPromise(jobId);
  }

  async stream(jobId: string): Promise<Readable> {
    const stream = new Transform({
      objectMode: true,
      transform: (chunk, encoding, callback) => {
        callback(null, chunk);
      },
    });

    const subscription = await this.network.subscribeData((message) => {
      if (message.type === MessageType.JOB_DATA && message.data.id === jobId) {
        stream.write(message.data.data);
      }
    });

    stream.on("close", () => {
      subscription.unsubscribe();
    });

    this.getJobCompletedPromise(jobId).then(() => {
      stream.end();
    });

    return stream;
  }

  /**
   * Retrieve the current state of a job
   * @param id
   * @returns
   */
  async getJob(id: string): Promise<Job | null> {
    const message = this.createMessage({
      type: MessageType.QUERY_JOBS,
      destination: "*",
      data: { id },
    });

    const response =
      await this.sendAndAwaitResponse<MessageType.QUERY_JOBS_RESPONSE>(
        message,
        1000
      );

    return response.data[0];
  }

  private async createJob(
    options: Job["options"],
    priority: Job["priority"] = 0
  ) {
    const message = this.createMessage({
      type: MessageType.CREATE_JOB,
      destination: "composer",
      data: { options, priority },
    });
    const response =
      await this.sendAndAwaitResponse<MessageType.CREATE_JOB_RESPONSE>(
        message,
        1000
      );
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
