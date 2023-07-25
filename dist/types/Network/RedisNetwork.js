import { Subject } from "rxjs";
import { Network } from "./Network.js";
import { MessageType } from "./Message.js";
export class RedisNetwork extends Network {
    connection;
    options;
    static channelName = "redis-network-channel";
    channel = new Subject();
    constructor(connection, options) {
        super();
        this.connection = connection;
        this.options = options;
        if (this.options.debug) {
            this.channel.subscribe((message) => {
                console.log(`RedisNetwork: [${message.type}] (${MessageType[message.type]})`, message);
            });
        }
    }
    get transformer() {
        return (this.options.transformer || {
            format: (message) => JSON.stringify(message),
            parse: (message) => JSON.parse(message),
        });
    }
    async connect() {
        await new Promise((resolve, reject) => {
            this.connection.subscriber.subscribe(RedisNetwork.channelName, (err, count) => {
                if (err) {
                    this.error = err;
                    this.connected = false;
                    reject(err);
                }
                else {
                    this.connected = true;
                    resolve();
                }
            });
            this.connection.subscriber.on("message", (channel, message) => {
                this.channel.next(this.transformer.parse(message));
            });
        });
    }
    async publish(message) {
        await this.connection.publisher.publish(RedisNetwork.channelName, this.transformer.format(message));
    }
    subscribe(callback) {
        return this.channel.subscribe(callback);
    }
}
//# sourceMappingURL=RedisNetwork.js.map