import { workerData, parentPort } from "worker_threads";
import { Job, Workspace } from "../../index.js";
import { WorkerMessage, WorkerMessageType } from "./WorkerMessage.js";
import {
  WorkspaceParams,
  WorkspaceResult,
  WorkspaceScript,
} from "../Workspace.js";

/**
 * Exists inside the Worker thread, used to communicate with the Instrument.
 */
export class Worker<
  W extends Workspace<any, any>,
  S extends WorkspaceScript<W>
> {
  constructor() {}

  get params(): WorkspaceParams<W, S> {
    return workerData.params;
  }

  return(result: WorkspaceResult<W, S>) {
    parentPort?.postMessage({
      type: WorkerMessageType.WORK_RESULT,
      data: {
        result,
      },
    } satisfies WorkerMessage<WorkerMessageType.WORK_RESULT>);

    parentPort?.close();
    // exit process with success
    process.exit(0);
  }
}
