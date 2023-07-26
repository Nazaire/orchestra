import { Subject } from "rxjs";
import { Network } from "./Network.js";
import { Message, MessageType, StrictMessage } from "./Message.js";

export class MemNetwork extends Network {
  channel = new Subject<Message>();
  private dataChannel = new Subject<StrictMessage<MessageType.JOB_DATA>>();

  connected: boolean = true;

  constructor(
    private options: { debug?: boolean } = {
      debug: false,
    }
  ) {
    super();

    if (this.options.debug) {
      this.channel.subscribe((message) => {
        console.log(
          `MemNetwork: [${message.type}] (${MessageType[message.type]})`,
          message
        );
      });
    }
  }

  public async connect() {
    return;
  }

  public async publish(message: Message): Promise<void> {
    return this.channel.next(message);
  }

  public async publishData(
    message: StrictMessage<MessageType.JOB_DATA>
  ): Promise<void> {
    return this.dataChannel.next(message);
  }

  public subscribe(callback: (message: Message) => void) {
    return this.channel.subscribe(callback);
  }

  public async subscribeData(
    callback: (message: StrictMessage<MessageType.JOB_DATA>) => void
  ) {
    return this.dataChannel.subscribe(callback);
  }
}
