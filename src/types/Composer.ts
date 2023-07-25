import { nanoid } from "nanoid";
import {
  Network,
  Message,
  MessageType,
  StrictMessage,
  NetworkClient,
} from "./Network/index.js";
import { Job } from "./Job/Job.js";
import { JobQueue } from "./Job/JobQueue.js";

export class Composer extends NetworkClient {
  public readonly id = "composer_" + nanoid();

  private queue = new JobQueue();

  constructor(
    network: Network,
    private readonly options?: {
      debug?: boolean;
    }
  ) {
    super("composer", network);

    this.on(MessageType.CREATE_JOB, this.onCreateJobMessage.bind(this));
    this.on(MessageType.QUERY_JOBS, this.onQueryJobsMessage.bind(this));

    this.on(MessageType.JOB_REQUEST, this.onJobRequestMessage.bind(this));
    this.on(MessageType.JOB_COMPLETED, this.onJobCompletedMessage.bind(this));
  }

  private async onQueryJobsMessage(msg: StrictMessage<MessageType.QUERY_JOBS>) {
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

  private async onCreateJobMessage(msg: StrictMessage<MessageType.CREATE_JOB>) {
    const job = this.queue.createJob(msg.data);

    if (this.options?.debug) {
      console.log(
        `Composer: Created job ${job.id}. Waiting jobs: ${this.queue.size}`
      );
    }

    const response = this.createResponseTo(msg, {
      type: MessageType.CREATE_JOB_RESPONSE,
      data: job,
    });

    await this.send(response);

    this.notifyWorkersIfAvailableWork();
  }

  private async notifyWorkersIfAvailableWork() {
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

  private async onJobRequestMessage(
    msg: StrictMessage<MessageType.JOB_REQUEST>
  ) {
    const jobId = this.queue.next();

    let job: Job | null = null;

    if (jobId) job = this.queue.start(jobId);

    const response = this.createResponseTo(msg, {
      type: MessageType.JOB_RESPONSE,
      data: job,
    });

    // todo: is there an edge case if the Instrument reaches it's timeout before this message is received?
    // todo: we should have a confirmation message from the Instrument that it has received the message
    // todo: and if it hasn't, we should requeue the job
    // todo: or we should have a interval check on the Composer side to determine if a Job has stalled or been lost

    await this.send(response);
  }

  private async onJobCompletedMessage(
    msg: StrictMessage<MessageType.JOB_COMPLETED>
  ) {
    const job = this.queue.complete(
      msg.data.id,
      msg.data.result,
      msg.data.error || null
    );

    if (this.options?.debug) {
      console.log(
        `Composer: Job ${job.id} completed. Waiting jobs: ${this.queue.size}`
      );
    }

    this.notifyWorkersIfAvailableWork();
  }
}
