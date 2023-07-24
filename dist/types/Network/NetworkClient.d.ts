import { Network } from "./Network.js";
import { Message, StrictMessage, MessageData, MessageType } from "./Message.js";
export declare class NetworkClient {
    readonly id: string;
    protected readonly network: Network;
    constructor(id: string, network: Network);
    protected createMessage<T extends MessageType>({ type, destination, data, responseTo, }: {
        type: T;
        data: MessageData[T];
    } & Pick<Message, "destination" | "responseTo">): StrictMessage<T>;
    protected on<T extends MessageType>(type: T, handler: (message: StrictMessage<T>) => void): import("rxjs").Subscription;
    protected createResponseTo<T extends MessageType>(responseTo: Message, { type, data }: {
        type: T;
        data: MessageData[T];
    }): StrictMessage<T>;
    protected send(message: Message): Promise<void>;
    protected sendAndAwaitResponse<T extends MessageType>(message: Message): Promise<StrictMessage<T>>;
}
//# sourceMappingURL=NetworkClient.d.ts.map