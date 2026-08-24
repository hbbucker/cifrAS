class IncomingMessageDTO {
  constructor({ threadId, channelId, userText, files = [] }) {
    this.threadId = threadId;
    this.channelId = channelId;
    this.userText = userText;
    this.files = files;
  }
}

class ExecutionResultDTO {
  constructor({ success, sessionId = null, responseText = '', filePaths = [], error = null }) {
    this.success = Boolean(success);
    this.sessionId = sessionId;
    this.responseText = responseText;
    this.filePaths = filePaths;
    this.error = error;
  }
}

module.exports = { IncomingMessageDTO, ExecutionResultDTO };
