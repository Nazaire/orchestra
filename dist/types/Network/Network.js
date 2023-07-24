export class Network {
    connected = false;
    error = null;
    constructor() { }
    subscribe(callback) {
        return this.channel.subscribe(callback);
    }
    first = async (predicate) => {
        return new Promise(async (resolve, reject) => {
            const subscription = this.subscribe((msg) => {
                if (predicate(msg)) {
                    subscription.unsubscribe();
                    resolve(msg);
                }
            });
        });
    };
    response = async (responseTo) => {
        return this.first((msg) => msg.responseTo === responseTo);
    };
}
//# sourceMappingURL=Network.js.map