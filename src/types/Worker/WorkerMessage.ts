export interface WorkerMessage<T extends WorkerMessageType> {
  type: T;
  data: WorkerMessageData[T];
}

export enum WorkerMessageType {
  WORK_RESULT = 0,
  WORK_DATA = 1,
}

export type WorkerMessageData = {
  [WorkerMessageType.WORK_RESULT]: {
    result: any;
  };
  [WorkerMessageType.WORK_DATA]: any;
};
