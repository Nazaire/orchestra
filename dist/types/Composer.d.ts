import { Network, NetworkClient } from "./Network/index.js";
export declare class Composer extends NetworkClient {
    readonly id: string;
    private queue;
    constructor(network: Network);
    private onQueryJobsMessage;
    private onCreateJobMessage;
    private notifyWorkersIfAvailableWork;
    private onJobRequestMessage;
    private onJobCompletedMessage;
}
//# sourceMappingURL=Composer.d.ts.map