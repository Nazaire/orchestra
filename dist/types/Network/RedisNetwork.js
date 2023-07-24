import { Subject } from "rxjs";
import { Network } from "./Network.js";
export class RedisNetwork extends Network {
    connection;
    transformer;
    static channelName = "redis-network-channel";
    channel = new Subject();
    constructor(connection, transformer = {
        format: (message) => JSON.stringify(message),
        parse: (message) => JSON.parse(message),
    }) {
        super();
        this.connection = connection;
        this.transformer = transformer;
    }
    async connect() {
        await new Promise((resolve, reject) => {
            this.connection.subscribe(RedisNetwork.channelName, (err, count) => {
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
            this.connection.on("message", (channel, message) => {
                this.channel.next(this.transformer.parse(message));
            });
        });
    }
    async publish(message) {
        await this.connection.publish(RedisNetwork.channelName, this.transformer.format(message));
    }
    subscribe(callback) {
        return this.channel.subscribe(callback);
    }
}
//# sourceMappingURL=RedisNetwork.js.map