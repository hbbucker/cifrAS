class EngineQuotaExhaustedError extends Error {
  constructor(retryAfterSeconds = null) {
    super('The engine quota is temporarily exhausted');
    this.name = 'EngineQuotaExhaustedError';
    this.code = 'ENGINE_QUOTA_EXHAUSTED';
    this.provider = 'antigravity';
    this.retryAfterSeconds = Number.isInteger(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds
      : null;
  }
}

module.exports = { EngineQuotaExhaustedError };
