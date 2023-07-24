import { Workspace, WorkspaceParams, WorkspaceScript } from "../Workspace.js";
type JobStatus = "waiting" | "active" | "completed";
export interface Job {
    id: string;
    status: JobStatus;
    options: JobOptions;
    result: any | null | undefined;
    error: string | null | undefined;
}
export interface JobOptions {
    /**
     * The path to the worker script.
     */
    script: string;
    /**
     * Params to pass to the worker.
     */
    params: any;
}
export interface StrictJobOptions<W extends Workspace<any, any>, S extends WorkspaceScript<W>> {
    /**
     * The path to the worker script.
     */
    script: S;
    /**
     * Params to pass to the worker.
     */
    params: WorkspaceParams<W, S>;
}
export {};
//# sourceMappingURL=Job.d.ts.map