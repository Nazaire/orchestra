export var MessageType;
(function (MessageType) {
    /**
     * The composer is announcing that it has work available.
     */
    MessageType[MessageType["JOB_AVAILABLE"] = 100] = "JOB_AVAILABLE";
    /**
     * The instrument is requesting work.
     */
    MessageType[MessageType["JOB_REQUEST"] = 101] = "JOB_REQUEST";
    /**
     * The composer is allocating a job to an instrument.
     */
    MessageType[MessageType["JOB_RESPONSE"] = 102] = "JOB_RESPONSE";
    /**
     * The job is complete and the instrument is returning the result.
     */
    MessageType[MessageType["JOB_COMPLETED"] = 103] = "JOB_COMPLETED";
    /**
     * Query the jobs available on the composer.
     */
    MessageType[MessageType["QUERY_JOBS"] = 201] = "QUERY_JOBS";
    /**
     * The composer returns the jobs available based on the query
     */
    MessageType[MessageType["QUERY_JOBS_RESPONSE"] = 202] = "QUERY_JOBS_RESPONSE";
    /**
     * A consumer is creating work to be done.
     */
    MessageType[MessageType["CREATE_JOB"] = 203] = "CREATE_JOB";
    /**
     * The composer returns the created job object
     */
    MessageType[MessageType["CREATE_JOB_RESPONSE"] = 204] = "CREATE_JOB_RESPONSE";
})(MessageType || (MessageType = {}));
//# sourceMappingURL=Message.js.map