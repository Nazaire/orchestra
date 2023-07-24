import { Subject, Subscription } from "rxjs";
import { Message, MessageType, StrictMessage } from "./Message.js";
export declare abstract class Network {
    connected: boolean;
    error: Error | null;
    constructor();
    abstract connect(): Promise<void>;
    abstract publish(message: Message): Promise<void>;
    abstract channel: Subject<Message>;
    subscribe(callback: (message: Message) => void): Subscription;
    first: (predicate: (m: Message) => boolean) => Promise<Message>;
    response: <T extends MessageType>(responseTo: string) => Promise<StrictMessage<T>>;
}
//# sourceMappingURL=Network.d.ts.map