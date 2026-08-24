class Execution {
  constructor({
    threadId,
    channelId,
    userText,
    startedAt = Date.now(),
    completedAt = null,
    status = 'PENDING', // PENDING, RUNNING, COMPLETED, FAILED
    error = null,
    latestResponse = '',
    filePaths = [],
  }) {
    this.threadId = threadId;
    this.channelId = channelId;
    this.userText = userText;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.status = status;
    this.error = error;
    this.latestResponse = latestResponse;
    this.filePaths = filePaths;
  }

  complete(latestResponse = '', filePaths = []) {
    this.status = 'COMPLETED';
    this.completedAt = Date.now();
    this.latestResponse = latestResponse;
    this.filePaths = filePaths;
  }

  fail(error) {
    this.status = 'FAILED';
    this.completedAt = Date.now();
    this.error = error;
  }
}

module.exports = { Execution };
