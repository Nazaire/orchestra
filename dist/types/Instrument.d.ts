import { Network, NetworkClient } from "./Network/index.js";
import { Workspace } from "./Workspace.js";
export declare class Instrument extends NetworkClient {
    private readonly workspace;
    readonly workers: number;
    constructor(network: Network, workspace: Workspace<any, any>, workers: number);
    private activeJobs;
    private handleJobAvailable;
    private startWorker;
}
//# sourceMappingURL=Instrument.d.ts.map