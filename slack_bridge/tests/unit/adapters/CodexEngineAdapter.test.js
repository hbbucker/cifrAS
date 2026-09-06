const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { CodexEngineAdapter, AsyncEventQueue } = require('../../../src/adapters/engines/codex/CodexEngineAdapter');
const { EngineInstructionDTO } = require('../../../src/domain/dtos/EngineInstructionDTO');

function createMockChild(run) {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  setImmediate(() => run(child));
  return child;
}

test('CodexEngineAdapter: buildCliArgs generates correct command line arguments', () => {
  const adapter = new CodexEngineAdapter();

  const argsWithoutSession = adapter.buildCliArgs({
    prompt: 'Olá Codex',
    sessionId: null,
    workspaceDir: '/path/to/project',
  });
  assert.deepEqual(argsWithoutSession, [
    'exec',
    'Olá Codex',
    '--add-dir', '/path/to/project',
    '--dangerously-bypass-approvals-and-sandbox',
    '--json',
  ]);

  const argsWithSession = adapter.buildCliArgs({
    prompt: 'Continuar task',
    sessionId: 'session-xyz',
    workspaceDir: '/path/to/project',
  });
  assert.deepEqual(argsWithSession, [
    'exec',
    'resume', 'session-xyz',
    'Continuar task',
    '--add-dir', '/path/to/project',
    '--dangerously-bypass-approvals-and-sandbox',
    '--json',
  ]);
});

test('CodexEngineAdapter: executeStream streams events and completes successfully', async () => {
  const adapter = new CodexEngineAdapter({
    spawnFn: () => createMockChild((child) => {
      child.stdout.emit('data', Buffer.from(JSON.stringify({ type: 'thread.started', thread_id: 'thread-123' }) + '\n'));
      child.stdout.emit('data', Buffer.from(JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Hello from Codex' } }) + '\n'));
      child.emit('close', 0);
    }),
  });

  const instruction = new EngineInstructionDTO({
    prompt: 'test prompt',
    sessionId: null,
    workspaceDir: '/tmp',
  });

  const events = [];
  for await (const event of adapter.executeStream(instruction)) {
    events.push(event);
  }

  assert.equal(events.length, 4);
  assert.equal(events[0].type, 'SESSION_BOUND');
  assert.equal(events[1].type, 'MILESTONE_COMPLETED');
  assert.equal(events[2].type, 'TEXT_DELTA_EMITTED');
  assert.equal(events[3].type, 'EXECUTION_COMPLETED');
  assert.equal(events[3].payload.result.responseText, 'Hello from Codex');
});
