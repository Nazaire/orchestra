import { Callback, Redis } from "ioredis";
import { Subject, Subscription } from "rxjs";
import { Network } from "./Network.js";
import { Message, MessageType, StrictMessage } from "./Message.js";

export class RedisNetwork extends Network {
  private static commsChannelName = "redis-network-channel-commons";
  private static dataChannelName = "redis-network-channel-data";

  public channel = new Subject<Message>();

  private subscriber!: Redis;
  private publisher!: Redis;

  private dataSubscriber!: Redis;
  private dataChannel = new Subject<StrictMessage<MessageType.JOB_DATA>>();

  constructor(
    private readonly getConnection: () => Redis,
    private readonly options: {
      debug?: boolean;
      transformer?: {
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
      this.subscriber = this.getConnection();
      this.publisher = this.getConnection();
      this.subscriber.subscribe(RedisNetwork.commsChannelName, (err, count) => {
        if (err) {
          this.error = err;
          this.connected = false;
          reject(err);
        } else {
          this.connected = true;
          resolve();
        }
      });
      this.subscriber.on("message", (channel, message) => {
        this.channel.next(this.transformer.parse(message));
      });
    });
  }

  public async connectData() {
    if (this.dataSubscriber) return;

    await new Promise<void>((resolve, reject) => {
      this.dataSubscriber = this.getConnection();
      this.dataSubscriber.subscribe(
        RedisNetwork.dataChannelName,
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
      this.dataSubscriber.on("message", (channel, message) => {
        this.dataChannel.next(
          this.transformer.parse(message) as StrictMessage<MessageType.JOB_DATA>
        );
      });
    });
  }

  public async publish(message: Message): Promise<void> {
    await this.publisher.publish(
      RedisNetwork.commsChannelName,
      this.transformer.format(message)
    );
  }

  public async publishData(
    message: StrictMessage<MessageType.JOB_DATA>
  ): Promise<void> {
    this.publisher.publish(
      RedisNetwork.dataChannelName,
      this.transformer.format(message)
    );
  }

  public async subscribeData(
    callback: (message: StrictMessage<MessageType.JOB_DATA>) => void
  ): Promise<Subscription> {
    if (!this.dataSubscriber) await this.connectData();

    return this.dataChannel.subscribe(callback);
  }

  public subscribe(callback: (message: Message) => void) {
    return this.channel.subscribe(callback);
  }
}
