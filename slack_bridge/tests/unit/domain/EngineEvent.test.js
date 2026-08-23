const test = require('node:test');
const assert = require('node:assert/strict');
const { EngineEvent } = require('../../../src/domain/events/EngineEvent');
const { TurnResultDTO } = require('../../../src/domain/dtos/TurnResultDTO');

test('EngineEvent: factory methods produce immutable, typed domain events', () => {
  const bound = EngineEvent.sessionBound('sess-123');
  assert.equal(bound.type, 'SESSION_BOUND');
  assert.equal(bound.payload.sessionId, 'sess-123');
  assert.ok(bound.timestamp > 0);

  const subagent = EngineEvent.subagentDiscovered('conv-456', 'CTO', { extra: true });
  assert.equal(subagent.type, 'SUBAGENT_DISCOVERED');
  assert.equal(subagent.payload.conversationId, 'conv-456');
  assert.equal(subagent.payload.typeName, 'CTO');
  assert.deepEqual(subagent.payload.metadata, { extra: true });

  const delta = EngineEvent.textDeltaEmitted('conv-456', 'Pensando na arquitetura');
  assert.equal(delta.type, 'TEXT_DELTA_EMITTED');
  assert.equal(delta.payload.textChunk, 'Pensando na arquitetura');

  const status = EngineEvent.statusUpdated('conv-456', 'Rodando testes');
  assert.equal(status.type, 'STATUS_UPDATED');
  assert.equal(status.payload.statusText, 'Rodando testes');

  const completed = EngineEvent.executionCompleted(new TurnResultDTO({ responseText: 'Feito!' }));
  assert.equal(completed.type, 'EXECUTION_COMPLETED');
  assert.equal(completed.payload.result.responseText, 'Feito!');

  const failed = EngineEvent.executionFailed(new Error('Falha no processo'), 2);
  assert.equal(failed.type, 'EXECUTION_FAILED');
  assert.equal(failed.payload.exitCode, 2);
  assert.equal(failed.payload.error.message, 'Falha no processo');
});
