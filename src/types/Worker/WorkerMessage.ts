export interface WorkerMessage<T extends WorkerMessageType> {
  type: T;
  data: WorkerMessageData[T];
}

export enum WorkerMessageType {
  WORK_RESULT = 0,
}

export type WorkerMessageData = {
  [WorkerMessageType.WORK_RESULT]: {
    status: "success" | "fail";
    result: any;
    error: string | null;
  };
};
