const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { AntigravityEngineAdapter } = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');
const { CodexEngineAdapter } = require('../../../src/adapters/engines/codex/CodexEngineAdapter');
const { ProcessMessageUseCase } = require('../../../src/application/usecases/ProcessMessageUseCase');

const fixturePath = path.resolve(__dirname, '../../fixtures/stream-json-cli.js');

class MemorySessionRepository {
  async getByThreadId() { return this.session || null; }
  async save(session) { this.session = session; }
}

class RecordingNotifier {
  constructor() { this.calls = []; }
  record(method, values) { this.calls.push({ method, values }); return Promise.resolve(); }
  sendAcknowledgement(...values) { return this.record('ack', values); }
  sendStatus(...values) { return this.record('status', values); }
  streamNarrative(...values) { return this.record('text', values); }
  sendPrimaryResponse(...values) { return this.record('primary', values); }
  sendMilestoneNotification(...values) { return this.record('milestone', values); }
  sendFinalConsolidation(...values) { return this.record('final', values); }
  setAssistantStatus(...values) { return this.record('assistantStatus', values); }
  sendErrorMessage(...values) { return this.record('error', values); }
}

function fixtureSpawn(mode) {
  return (_command, _args, options) => spawn(process.execPath, [fixturePath, mode], options);
}

async function runFlow(adapter) {
  const notifier = new RecordingNotifier();
  const repository = new MemorySessionRepository();
  const useCase = new ProcessMessageUseCase({
    llmEngine: adapter,
    notificationGateway: notifier,
    sessionRepository: repository,
    workspaceDir: process.cwd(),
  });
  const result = await useCase.execute({ threadId: 'thread-fixture', channelId: 'channel-fixture',
    userText: 'safe integration fixture' });
  return { result, calls: notifier.calls, session: repository.session };
}

test('Stream JSON Slack flow preserves Codex session, status, text, milestone and final response', async () => {
  const flow = await runFlow(new CodexEngineAdapter({ spawnFn: fixtureSpawn('codex-success') }));
  assert.equal(flow.result.success, true);
  assert.equal(flow.result.sessionId, 'codex-fixture-session');
  assert.equal(flow.result.responseText, 'codex fixture response');
  assert.equal(flow.calls.some((call) => call.method === 'status'), true);
  assert.equal(flow.calls.some((call) => call.method === 'text'), true);
  assert.equal(flow.calls.some((call) => call.method === 'primary'), true);
  assert.equal(flow.session.isActive, false);
});

test('Stream JSON Slack flow preserves Antigravity session, status, text, milestone and final response', async () => {
  const flow = await runFlow(new AntigravityEngineAdapter({ spawnFn: fixtureSpawn('antigravity-success') }));
  assert.equal(flow.result.success, true);
  assert.equal(flow.result.sessionId, 'agy-fixture-session');
  assert.equal(flow.result.responseText, 'agy fixture response');
  assert.equal(flow.calls.some((call) => call.method === 'status'), true);
  assert.equal(flow.calls.some((call) => call.method === 'text'), true);
  assert.equal(flow.calls.some((call) => call.method === 'primary'), true);
  assert.equal(flow.session.isActive, false);
});

test('Stream JSON Slack flow keeps quota diagnostics out of public payloads', async () => {
  const flow = await runFlow(new AntigravityEngineAdapter({ spawnFn: fixtureSpawn('antigravity-quota') }));
  assert.equal(flow.result.success, false);
  assert.equal(flow.result.error.code, 'ENGINE_QUOTA_EXHAUSTED');
  const serializedCalls = JSON.stringify(flow.calls);
  assert.doesNotMatch(serializedCalls, /secret-fixture-id|Individual quota reached|safe integration fixture/);
  assert.equal(flow.calls.filter((call) => call.method === 'error').length, 1);
  assert.equal(flow.session.isActive, false);
});
