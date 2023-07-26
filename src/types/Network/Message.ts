import { Job, JobOptions } from "../Job/Job.js";

export interface Message {
  source: string;
  destination: string;
  id: string;
  type: number;
  data: object | null;

  responseTo?: string;
}

export interface StrictMessage<K extends MessageType> {
  source: string;
  destination: string;
  id: string;
  type: K;
  data: MessageData[K];

  responseTo?: string;
}

export enum MessageType {
  /**
   * The instrument is announcing that it is connected to the network.
   */
  INSTRUMENT_CONNECTED = 100,

  /**
   * The composer is announcing that it has work available.
   */
  JOB_AVAILABLE = 101,

  /**
   * The instrument is requesting work.
   */
  JOB_REQUEST = 102,

  /**
   * The composer is allocating a job to an instrument.
   */
  JOB_RESPONSE = 103,

  /**
   * The job is complete and the instrument is returning the result.
   */
  JOB_COMPLETED = 104,

  /**
   * A chunk of data from the worker processing a job.
   */
  JOB_DATA = 105,

  /**
   * Query the jobs available on the composer.
   */
  QUERY_JOBS = 201,

  /**
   * The composer returns the jobs available based on the query
   */
  QUERY_JOBS_RESPONSE = 202,

  /**
   * A consumer is creating work to be done.
   */
  CREATE_JOB = 203,

  /**
   * The composer returns the created job object
   */
  CREATE_JOB_RESPONSE = 204,
}

export type MessageData = {
  [MessageType.CREATE_JOB]: {
    options: Job["options"];
    priority: Job["priority"];
  };
  [MessageType.CREATE_JOB_RESPONSE]: Job;

  [MessageType.QUERY_JOBS]: {
    id?: Job["id"];
    status?: Job["status"];
  };
  [MessageType.QUERY_JOBS_RESPONSE]: Job[];

  [MessageType.JOB_AVAILABLE]: null;
  [MessageType.JOB_REQUEST]: null;
  [MessageType.JOB_RESPONSE]: Job | null;
  [MessageType.JOB_DATA]: { id: Job["id"]; data: any };
  [MessageType.JOB_COMPLETED]: Job;

  [MessageType.INSTRUMENT_CONNECTED]: null;
};
