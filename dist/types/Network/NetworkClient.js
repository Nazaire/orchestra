import { nanoid } from "nanoid";
export class NetworkClient {
    id;
    network;
    constructor(id, network) {
        this.id = id;
        this.network = network;
    }
    createMessage({ type, destination, data, responseTo, }) {
        return {
            source: this.id,
            destination: destination,
            id: nanoid(),
            type,
            data,
            responseTo,
        };
    }
    on(type, handler) {
        return this.network.subscribe((message) => {
            if (message.destination !== "*" && message.destination !== this.id)
                return;
            if (message.type === type) {
                handler(message);
            }
        });
    }
    createResponseTo(responseTo, { type, data }) {
        return this.createMessage({
            type,
            data,
            destination: responseTo.source,
            responseTo: responseTo.id,
        });
    }
    async send(message) {
        await this.network.publish(message);
    }
    async sendAndAwaitResponse(message) {
        const response = this.network.response(message.id);
        await this.send(message);
        const data = await response;
        return data;
    }
}
//# sourceMappingURL=NetworkClient.js.map