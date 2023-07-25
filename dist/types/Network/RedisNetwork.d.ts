import { Redis } from "ioredis";
import { Subject } from "rxjs";
import { Network } from "./Network.js";
import { Message } from "./Message.js";
export declare class RedisNetwork extends Network {
    private readonly connection;
    private readonly options;
    private static channelName;
    channel: Subject<Message>;
    constructor(connection: {
        publisher: Redis;
        subscriber: Redis;
    }, options: {
        debug: boolean;
        transformer: {
            format: (message: Message) => string;
            parse: (message: string) => Message;
        };
    });
    private get transformer();
    connect(): Promise<void>;
    publish(message: Message): Promise<void>;
    subscribe(callback: (message: Message) => void): import("rxjs").Subscription;
}
//# sourceMappingURL=RedisNetwork.d.ts.map