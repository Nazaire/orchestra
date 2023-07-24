import { Subject } from "rxjs";
import { Network } from "./Network.js";
import { Message, MessageType } from "./Message.js";

export class MemNetwork extends Network {
  channel = new Subject<Message>();
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

  public subscribe(callback: (message: Message) => void) {
    return this.channel.subscribe(callback);
  }
}
