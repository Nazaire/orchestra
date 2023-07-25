import { Job, StrictJobOptions } from "./Job/Job.js";
import { Network } from "./Network/Network.js";
import { NetworkClient } from "./Network/NetworkClient.js";
import { Workspace, WorkspaceResult, WorkspaceScript } from "./Workspace.js";
export interface AddJobResult {
    job: Job;
    result: Promise<any>;
}
export interface StrictAddJobResult<W extends Workspace<any, any>, S extends WorkspaceScript<W>> {
    job: Job;
    result: Promise<WorkspaceResult<W, S>>;
}
export declare class Consumer<W extends Workspace<any, any>> extends NetworkClient {
    private readonly workspace;
    constructor(network: Network, workspace: W);
    /**
     * Public API with strict types
     * @param options
     * @returns
     */
    addJob<S extends WorkspaceScript<W>>(options: StrictJobOptions<W, S>): Promise<StrictAddJobResult<W, S>>;
    bulkAddJobs<S extends WorkspaceScript<W>>(options: StrictJobOptions<W, S>[]): Promise<StrictAddJobResult<W, S>[]>;
    runJob<S extends WorkspaceScript<W>>(options: StrictJobOptions<W, S>): Promise<WorkspaceResult<W, S>>;
    runJobs<S extends WorkspaceScript<W>>(options: StrictJobOptions<W, S>[]): Promise<WorkspaceResult<W, S>[]>;
    getJob(id: string): Promise<Job[]>;
    private createJob;
    private getJobCompletedPromise;
    private getJobResultPromise;
}
//# sourceMappingURL=Consumer.d.ts.map