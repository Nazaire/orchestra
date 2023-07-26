import { Subject, Subscription } from "rxjs";
import { Message, MessageData, MessageType, StrictMessage } from "./Message.js";

export abstract class Network {
  connected: boolean = false;
  error: Error | null = null;

  constructor() {}

  public abstract connect(): Promise<void>;

  public abstract publish(message: Message): Promise<void>;

  public abstract channel: Subject<Message>;

  public subscribe(callback: (message: Message) => void): Subscription {
    return this.channel.subscribe(callback);
  }

  public abstract subscribeData(
    callback: (message: StrictMessage<MessageType.JOB_DATA>) => void
  ): Promise<Subscription>;

  public abstract publishData(
    message: StrictMessage<MessageType.JOB_DATA>
  ): Promise<void>;

  public first = async (
    predicate: (m: Message) => boolean
  ): Promise<Message> => {
    return new Promise<Message>(async (resolve, reject) => {
      const subscription = this.subscribe((msg) => {
        if (predicate(msg)) {
          subscription.unsubscribe();
          resolve(msg);
        }
      });
    });
  };

  public response = async <T extends MessageType>(
    responseTo: string
  ): Promise<StrictMessage<T>> => {
    return this.first((msg) => msg.responseTo === responseTo) as Promise<
      StrictMessage<T>
    >;
  };
}
