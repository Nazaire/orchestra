import { Subject } from "rxjs";
import { Network } from "./Network.js";
import { MessageType } from "./Message.js";
export class MemNetwork extends Network {
    options;
    channel = new Subject();
    connected = true;
    constructor(options = {
        debug: false,
    }) {
        super();
        this.options = options;
        if (this.options.debug) {
            this.channel.subscribe((message) => {
                console.log(`MemNetwork: [${message.type}] (${MessageType[message.type]})`, message);
            });
        }
    }
    async connect() {
        return;
    }
    async publish(message) {
        return this.channel.next(message);
    }
    subscribe(callback) {
        return this.channel.subscribe(callback);
    }
}
//# sourceMappingURL=MemNetwork.js.map