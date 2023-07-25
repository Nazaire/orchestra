import { nanoid } from "nanoid";
import { Network } from "./Network.js";
import { Message, StrictMessage, MessageData, MessageType } from "./Message.js";
import { NetworkError } from "./NetworkError.js";

export class NetworkClient {
  constructor(
    public readonly id: string,
    protected readonly network: Network
  ) {}

  protected createMessage<T extends MessageType>({
    type,
    destination,
    data,
    responseTo,
  }: { type: T; data: MessageData[T] } & Pick<
    Message,
    "destination" | "responseTo"
  >): StrictMessage<T> {
    return {
      source: this.id,
      destination: destination,
      id: "msg_" + nanoid(),
      type,
      data,
      responseTo,
    };
  }

  protected on<T extends MessageType>(
    type: T,
    handler: (message: StrictMessage<T>) => void
  ) {
    return this.network.subscribe((message) => {
      if (message.destination !== "*" && message.destination !== this.id)
        return;
      if (message.type === type) {
        handler(message as StrictMessage<T>);
      }
    });
  }

  protected createResponseTo<T extends MessageType>(
    responseTo: Message,
    { type, data }: { type: T; data: MessageData[T] }
  ) {
    return this.createMessage({
      type,
      data,
      destination: responseTo.source,
      responseTo: responseTo.id,
    });
  }

  protected async send(message: Message) {
    await this.network.publish(message);
  }

  protected async sendAndAwaitResponse<T extends MessageType>(
    message: Message,
    timeout: number
  ): Promise<StrictMessage<T>> {
    const responsePromise = this.network.response(message.id);

    await this.send(message);

    const response =
      timeout === Infinity || timeout <= 0
        ? await responsePromise
        : await Promise.race([
            responsePromise,
            this.timeout(
              timeout,
              `Timeout waiting for response from ${message.destination}`
            ),
          ]);

    if (response instanceof NetworkError) {
      throw response;
    }

    return response as StrictMessage<T>;
  }

  private timeout(ms: number, message: string) {
    return new Promise<NetworkError>((resolve) => {
      setTimeout(() => {
        resolve(new NetworkError(message));
      }, ms);
    });
  }
}
