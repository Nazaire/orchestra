import { Redis } from "ioredis";
import { Subject } from "rxjs";
import { Network } from "./Network.js";
import { Message } from "./Message.js";

export class RedisNetwork extends Network {
  private static channelName = "redis-network-channel";
  public channel = new Subject<Message>();

  constructor(
    private readonly connection: Redis,
    private readonly transformer: {
      format: (message: Message) => string;
      parse: (message: string) => Message;
    } = {
      format: (message: Message) => JSON.stringify(message),
      parse: (message: string) => JSON.parse(message) as Message,
    }
  ) {
    super();
  }

  public async connect() {
    await new Promise<void>((resolve, reject) => {
      this.connection.subscribe(RedisNetwork.channelName, (err, count) => {
        if (err) {
          this.error = err;
          this.connected = false;
          reject(err);
        } else {
          this.connected = true;
          resolve();
        }
      });
      this.connection.on("message", (channel, message) => {
        this.channel.next(this.transformer.parse(message));
      });
    });
  }

  public async publish(message: Message): Promise<void> {
    await this.connection.publish(
      RedisNetwork.channelName,
      this.transformer.format(message)
    );
  }

  public subscribe(callback: (message: Message) => void) {
    return this.channel.subscribe(callback);
  }
}
