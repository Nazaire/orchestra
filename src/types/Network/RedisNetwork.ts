import { Redis } from "ioredis";
import { Subject } from "rxjs";
import { Network } from "./Network.js";
import { Message, MessageType } from "./Message.js";

export class RedisNetwork extends Network {
  private static channelName = "redis-network-channel";
  public channel = new Subject<Message>();

  constructor(
    private readonly connection: { publisher: Redis; subscriber: Redis },
    private readonly options: {
      debug: boolean;
      transformer: {
        format: (message: Message) => string;
        parse: (message: string) => Message;
      };
    }
  ) {
    super();

    if (this.options.debug) {
      this.channel.subscribe((message) => {
        console.log(
          `RedisNetwork: [${message.type}] (${MessageType[message.type]})`,
          message
        );
      });
    }
  }

  private get transformer() {
    return (
      this.options.transformer || {
        format: (message: Message) => JSON.stringify(message),
        parse: (message: string) => JSON.parse(message) as Message,
      }
    );
  }

  public async connect() {
    await new Promise<void>((resolve, reject) => {
      this.connection.subscriber.subscribe(
        RedisNetwork.channelName,
        (err, count) => {
          if (err) {
            this.error = err;
            this.connected = false;
            reject(err);
          } else {
            this.connected = true;
            resolve();
          }
        }
      );
      this.connection.subscriber.on("message", (channel, message) => {
        this.channel.next(this.transformer.parse(message));
      });
    });
  }

  public async publish(message: Message): Promise<void> {
    await this.connection.publisher.publish(
      RedisNetwork.channelName,
      this.transformer.format(message)
    );
  }

  public subscribe(callback: (message: Message) => void) {
    return this.channel.subscribe(callback);
  }
}
