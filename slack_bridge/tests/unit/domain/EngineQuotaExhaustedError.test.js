const test = require('node:test');
const assert = require('node:assert/strict');
const { EngineQuotaExhaustedError } = require('../../../src/domain/errors/EngineQuotaExhaustedError');

test('EngineQuotaExhaustedError: exposes only the safe quota contract', () => {
  const error = new EngineQuotaExhaustedError(1301);

  assert.equal(error.name, 'EngineQuotaExhaustedError');
  assert.equal(error.message, 'The engine quota is temporarily exhausted');
  assert.equal(error.code, 'ENGINE_QUOTA_EXHAUSTED');
  assert.equal(error.provider, 'antigravity');
  assert.equal(error.retryAfterSeconds, 1301);
  assert.equal(error.rawOutput, undefined);
  assert.equal(error.errorId, undefined);
  assert.equal(error.cause, undefined);
});

test('EngineQuotaExhaustedError: normalizes invalid retry durations to null', () => {
  for (const value of [undefined, null, 0, -1, 1.5, '41']) {
    assert.equal(new EngineQuotaExhaustedError(value).retryAfterSeconds, null);
  }
});
