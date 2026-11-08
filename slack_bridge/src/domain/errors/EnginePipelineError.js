const SAFE_MESSAGES = Object.freeze({
  ENGINE_STREAM_LINE_LIMIT: 'Engine stream line limit exceeded',
  ENGINE_STREAM_EVENT_LIMIT: 'Engine stream event limit exceeded',
  ENGINE_PROTOCOL_STATE_LIMIT: 'Engine protocol state limit exceeded',
  ENGINE_PROTOCOL_FAILURE: 'Engine protocol reported a failure',
  ENGINE_PROTOCOL_MISSING_RESPONSE: 'Engine protocol completed without a response',
  ENGINE_PROTOCOL_TERMINAL_MISSING: 'Engine protocol closed without a terminal event',
  ENGINE_PROCESS_FAILURE: 'Engine process failed',
  ENGINE_PROCESS_TIMEOUT: 'Engine process timed out',
  ENGINE_PROCESS_CLEANUP_FAILED: 'Engine process cleanup could not be confirmed',
  ENGINE_EXECUTION_CANCELLED: 'Engine execution was cancelled',
});

class EnginePipelineError extends Error {
  constructor(code) {
    const safeMessage = SAFE_MESSAGES[code] || SAFE_MESSAGES.ENGINE_PROCESS_FAILURE;
    super(safeMessage);
    this.name = 'EnginePipelineError';
    this.code = SAFE_MESSAGES[code] ? code : 'ENGINE_PROCESS_FAILURE';
  }
}

module.exports = { EnginePipelineError, SAFE_MESSAGES };
