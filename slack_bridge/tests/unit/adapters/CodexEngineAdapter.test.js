const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { CodexEngineAdapter } = require('../../../src/adapters/engines/codex/CodexEngineAdapter');
const { EngineInstructionDTO } = require('../../../src/domain/dtos/EngineInstructionDTO');

function createChild(records, { exitCode = 0, stderr = '' } = {}) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => {};
  setImmediate(() => {
    child.stdout.write(records.map((record) => JSON.stringify(record)).join('\n') + '\n');
    if (stderr) child.stderr.write(stderr);
    child.emit('exit', exitCode, null);
    child.emit('close', exitCode, null);
  });
  return child;
}

async function collect(adapter) {
  const events = [];
  for await (const event of adapter.executeStream(new EngineInstructionDTO({
    prompt: 'safe fixture', workspaceDir: '/tmp',
  }))) events.push(event);
  return events;
}

test('CodexEngineAdapter builds existing CLI argument contract', () => {
  const adapter = new CodexEngineAdapter();
  assert.deepEqual(adapter.buildCliArgs({ prompt: 'Olá', sessionId: null, workspaceDir: '/work' }),
    ['exec', 'Olá', '--add-dir', '/work', '--dangerously-bypass-approvals-and-sandbox', '--json']);
  assert.deepEqual(adapter.buildCliArgs({ prompt: 'Continue', sessionId: 'thread-1', workspaceDir: '/work' }),
    ['exec', 'resume', 'thread-1', 'Continue', '--add-dir', '/work',
      '--dangerously-bypass-approvals-and-sandbox', '--json']);
});

test('CodexEngineAdapter confirms current agent message only with turn.completed', async () => {
  const adapter = new CodexEngineAdapter({ spawnFn: () => createChild([
    { type: 'thread.started', thread_id: 'thread-123' },
    { type: 'item.started', item: { type: 'command_execution', command: 'npm test' } },
    { type: 'item.completed', item: { type: 'agent_message', text: 'current response' } },
    { type: 'turn.completed' },
  ]) });
  const events = await collect(adapter);
  assert.deepEqual(events.map((event) => event.type), [
    'SESSION_BOUND', 'STATUS_UPDATED', 'MILESTONE_COMPLETED', 'TEXT_DELTA_EMITTED', 'EXECUTION_COMPLETED',
  ]);
  assert.equal(events.at(-1).payload.result.responseText, 'current response');
  assert.deepEqual(events.at(-1).payload.result.filePaths, []);
});

test('CodexEngineAdapter rejects completed turn without current message', async () => {
  const adapter = new CodexEngineAdapter({ spawnFn: () => createChild([
    { type: 'thread.started', thread_id: 'thread-123' }, { type: 'turn.completed' },
  ]) });
  const events = await collect(adapter);
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.equal(events.at(-1).payload.error.code, 'ENGINE_PROTOCOL_MISSING_RESPONSE');
});

test('CodexEngineAdapter rejects message without terminal and zero close', async () => {
  const adapter = new CodexEngineAdapter({ spawnFn: () => createChild([
    { type: 'thread.started', thread_id: 'thread-123' },
    { type: 'item.completed', item: { type: 'agent_message', text: 'not confirmed' } },
  ]) });
  const events = await collect(adapter);
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.equal(events.at(-1).payload.error.code, 'ENGINE_PROTOCOL_TERMINAL_MISSING');
});

test('CodexEngineAdapter sanitizes turn.failed and error vendor content', async () => {
  for (const type of ['turn.failed', 'error']) {
    const adapter = new CodexEngineAdapter({ spawnFn: () => createChild([
      { type, message: 'secret-vendor-output' },
    ]) });
    const events = await collect(adapter);
    assert.equal(events.at(-1).payload.error.code, 'ENGINE_PROTOCOL_FAILURE');
    assert.doesNotMatch(JSON.stringify(events), /secret-vendor-output/);
  }
});

test('CodexEngineAdapter gives nonzero exit precedence over success candidate', async () => {
  const adapter = new CodexEngineAdapter({ spawnFn: () => createChild([
    { type: 'item.completed', item: { type: 'agent_message', text: 'candidate' } },
    { type: 'turn.completed' },
  ], { exitCode: 9 }) });
  const events = await collect(adapter);
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.equal(events.at(-1).payload.error.code, 'ENGINE_PROCESS_FAILURE');
});
