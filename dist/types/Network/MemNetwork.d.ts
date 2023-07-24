import { Subject } from "rxjs";
import { Network } from "./Network.js";
import { Message } from "./Message.js";
export declare class MemNetwork extends Network {
    private options;
    channel: Subject<Message>;
    connected: boolean;
    constructor(options?: {
        debug?: boolean;
    });
    connect(): Promise<void>;
    publish(message: Message): Promise<void>;
    subscribe(callback: (message: Message) => void): import("rxjs").Subscription;
}
//# sourceMappingURL=MemNetwork.d.ts.map