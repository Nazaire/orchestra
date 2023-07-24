import { workerData, parentPort } from "worker_threads";
import { WorkerMessageType } from "./WorkerMessage.js";
/**
 * Exists inside the Worker thread, used to communicate with the Instrument.
 */
export class Worker {
    constructor() { }
    get params() {
        return workerData.params;
    }
    resolve(result) {
        parentPort?.postMessage({
            type: WorkerMessageType.WORK_RESULT,
            data: {
                status: "success",
                result,
                error: null,
            },
        });
        parentPort?.close();
        // exit process with success
        process.exit(0);
    }
}
//# sourceMappingURL=Worker.js.map