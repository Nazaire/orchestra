import { Job, StrictJobOptions } from "./Job/Job.js";
import { Network } from "./Network/Network.js";
import { NetworkClient } from "./Network/NetworkClient.js";
import { Workspace, WorkspaceScript } from "./Workspace.js";
export interface AddJobResult {
    job: Job;
    result: Promise<Job>;
}
export declare class Consumer<W extends Workspace<any, any>> extends NetworkClient {
    private readonly workspace;
    constructor(network: Network, workspace: W);
    /**
     * Public API with strict types
     * @param options
     * @returns
     */
    addJob<S extends WorkspaceScript<W>>(options: StrictJobOptions<W, S>): Promise<AddJobResult>;
    bulkAddJobs<S extends WorkspaceScript<W>>(options: StrictJobOptions<W, S>[]): Promise<AddJobResult[]>;
    runJob<S extends WorkspaceScript<W>>(options: StrictJobOptions<W, S>): Promise<any>;
    runJobs<S extends WorkspaceScript<W>>(options: StrictJobOptions<W, S>[]): Promise<any[]>;
    getJob(id: string): Promise<Job[]>;
    private createJob;
    private getJobCompletedPromise;
    private getJobResultPromise;
}
//# sourceMappingURL=Consumer.d.ts.map