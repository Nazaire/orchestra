import { nanoid } from "nanoid";
import {
  StrictMessage,
  Network,
  NetworkClient,
  MessageType,
} from "./Network/index.js";
import { Worker } from "worker_threads";
import { Job } from "./Job/Job.js";
import { Workspace } from "./Workspace.js";
import { WorkerMessage, WorkerMessageType } from "./Worker/WorkerMessage.js";

export class Instrument extends NetworkClient {
  constructor(
    network: Network,
    private readonly workspace: Workspace<any, any>,
    public readonly workers: number,
    private readonly options?: {
      debug?: boolean;
    }
  ) {
    super("instrument_" + nanoid(), network);

    this.on(MessageType.JOB_AVAILABLE, this.handleJobAvailable.bind(this));
  }

  private activeJobs = new Map<string, Worker>();

  private async handleJobAvailable(
    msg: StrictMessage<MessageType.JOB_AVAILABLE>
  ) {
    if (this.activeJobs.size >= this.workers) {
      return;
    }

    const workRequest = this.createResponseTo(msg, {
      type: MessageType.JOB_REQUEST,
      data: null,
    });

    const response = await this.sendAndAwaitResponse<MessageType.JOB_RESPONSE>(
      workRequest,
      1000
    );

    if (response.data === null) {
      // No work available.
      return;
    } else {
      this.startWorker(response.data);
    }
  }

  private async startWorker(job: Job) {
    const complete = async (result: any, error: string | null) => {
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
      // create a worker
      const worker = new Worker(
        this.workspace.getPath(String(job.options.script)),
        {
          workerData: {
            params: job.options.params,
          },
        }
      );

      if (this.options?.debug) {
        console.log(
          `Instrument: Started worker for job ${job.id}. Worker count: ${this.activeJobs.size}/${this.workers}`
        );
      }

      this.activeJobs.set(job.id, worker);

      const complete = async (result: any, error: string | null) => {
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

        if (this.options?.debug) {
          console.log(
            `Instrument: Job ${job.id} completed with result: ${String(
              result
            )} and error: ${String(error)}`
          );
        }
      };

      // node.js worker bindings

      worker.on("message", (message: WorkerMessage<any>) => {
        if (message.type === WorkerMessageType.WORK_RESULT) {
          complete(message.data.result, message.data.error);
          worker.terminate();
        }
      });

      worker.on("error", (error) => {
        complete(null, [error.message, error.stack].filter(Boolean).join("\n"));
      });

      worker.on("exit", (code) => {
        if (this.options?.debug) {
          console.log(
            `Instrument: Worker for job ${job.id} exited with code ${code}.`
          );
        }
        if (code === 0) {
          complete(null, null);
        } else {
          complete(null, String(new Error("Worker exited with code " + code)));
        }
      });
    } catch (error) {
      console.error(error);
      complete(null, String(error));
    }
  }
}
