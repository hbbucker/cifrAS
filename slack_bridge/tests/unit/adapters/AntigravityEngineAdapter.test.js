const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { EventEmitter } = require('node:events');
const {
  AntigravityEngineAdapter,
  AsyncEventQueue,
  DEFAULT_BRAIN_DIR,
  TRANSCRIPT_RELATIVE_PATH,
} = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');
const { EngineInstructionDTO } = require('../../../src/domain/dtos/EngineInstructionDTO');

test('AsyncEventQueue: enqueues, pulls, and terminates cleanly', async () => {
  const queue = new AsyncEventQueue();
  queue.push('item1');
  queue.push('item2');

  const items = [];
  setTimeout(() => {
    queue.push('item3');
    queue.close();
  }, 10);

  for await (const item of queue) {
    items.push(item);
  }

  assert.deepEqual(items, ['item1', 'item2', 'item3']);
});

test('AntigravityEngineAdapter: buildCliArgs generates correct flag array with and without sessionId', () => {
  const adapter = new AntigravityEngineAdapter();

  const argsWithoutSession = adapter.buildCliArgs({
    prompt: 'Olá CEO',
    sessionId: null,
    workspaceDir: '/path/to/project',
  });
  assert.deepEqual(argsWithoutSession, [
    '-p', 'Olá CEO',
    '--add-dir', '/path/to/project',
    '--print-timeout', '1h',
    '--dangerously-skip-permissions',
    '--output-format', 'stream-json',
  ]);

  const argsWithSession = adapter.buildCliArgs({
    prompt: 'Continuar task',
    sessionId: 'session-xyz-123',
    workspaceDir: '/path/to/project',
  });
  assert.deepEqual(argsWithSession, [
    '-p', 'Continuar task',
    '--add-dir', '/path/to/project',
    '--conversation', 'session-xyz-123',
    '--print-timeout', '1h',
    '--dangerously-skip-permissions',
    '--output-format', 'stream-json',
  ]);
});

test('AntigravityEngineAdapter: translateStreamEvent correctly maps NDJSON events to EngineEvent instances in queue', () => {
  const adapter = new AntigravityEngineAdapter();
  const queue = new AsyncEventQueue();
  const context = { boundSessionId: 'root-123' };

  // 1. Evento init
  adapter.translateStreamEvent({ event: 'init', conversation_id: 'session-bound-999' }, queue, context);
  assert.equal(context.boundSessionId, 'session-bound-999');

  // 2. Evento subagent_info
  adapter.translateStreamEvent({
    event: 'step_update',
    step_update: {
      subagent_info: {
        subagents: [{ conversation_id: 'sub-456', role: 'CTO', type_name: 'startupos-cto' }],
      },
    },
  }, queue, context);

  // 3. Evento agent_response ativo (delta) seguido de DONE (marco)
  adapter.translateStreamEvent({
    event: 'step_update',
    step_update: {
      step_type: 'agent_response',
      conversation_id: 'sub-456',
      step_index: 2,
      state: 'ACTIVE',
      text_delta: 'Configurando migrations...',
    },
  }, queue, context);

  adapter.translateStreamEvent({
    event: 'step_update',
    step_update: {
      step_type: 'agent_response',
      conversation_id: 'sub-456',
      step_index: 2,
      state: 'DONE',
      text_delta: ' e tabelas prontas.',
      duration_seconds: 4.2,
    },
  }, queue, context);

  // 4. Evento status_text
  adapter.translateStreamEvent({
    event: 'step_update',
    step_update: {
      status_text: 'Executando comando no terminal',
    },
  }, queue, context);

  queue.close();

  const events = [];
  for (const ev of queue._queue) {
    events.push(ev);
  }

  assert.equal(events[0].type, 'SESSION_BOUND');
  assert.equal(events[0].payload.sessionId, 'session-bound-999');

  assert.equal(events[1].type, 'SUBAGENT_DISCOVERED');
  assert.equal(events[1].payload.conversationId, 'sub-456');
  assert.equal(events[1].payload.typeName, 'CTO');

  assert.equal(events[2].type, 'TEXT_DELTA_EMITTED');
  assert.equal(events[2].payload.textChunk, 'Configurando migrations...');

  assert.equal(events[3].type, 'TEXT_DELTA_EMITTED');
  assert.equal(events[3].payload.textChunk, ' e tabelas prontas.');

  assert.equal(events[4].type, 'MILESTONE_COMPLETED');
  assert.equal(events[4].payload.conversationId, 'sub-456');
  assert.equal(events[4].payload.milestoneText, 'Configurando migrations... e tabelas prontas.');
  assert.equal(events[4].payload.metadata.stepIndex, 2);

  assert.equal(events[5].type, 'STATUS_UPDATED');
  assert.equal(events[5].payload.conversationId, 'session-bound-999');
  assert.equal(events[5].payload.statusText, 'Executando comando no terminal');
});

test('AntigravityEngineAdapter: readTranscriptResponse asynchronously reads and extracts the latest PLANNER_RESPONSE', async () => {
  const tempBrainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy_brain_read_'));
  const sessionId = 'test-session-read-789';
  const transcriptDir = path.join(tempBrainDir, sessionId, '.system_generated', 'logs');
  fs.mkdirSync(transcriptDir, { recursive: true });

  const transcriptContent = [
    JSON.stringify({ type: 'USER_INPUT', content: 'mensagem anterior' }),
    JSON.stringify({ type: 'PLANNER_RESPONSE', content: 'Resposta intermediária' }),
    JSON.stringify({ type: 'USER_INPUT', content: 'segunda mensagem' }),
    JSON.stringify({ type: 'PLANNER_RESPONSE', content: 'Resposta definitiva extraída do transcript.' }),
  ].join('\n');
  fs.writeFileSync(path.join(transcriptDir, 'transcript.jsonl'), transcriptContent);

  const adapter = new AntigravityEngineAdapter({ brainDir: tempBrainDir });

  try {
    const text = await adapter.readTranscriptResponse(sessionId);
    assert.equal(text, 'Resposta definitiva extraída do transcript.');

    const emptyResult = await adapter.readTranscriptResponse('non-existent-session');
    assert.equal(emptyResult, '');
  } finally {
    fs.rmSync(tempBrainDir, { recursive: true, force: true });
  }
});

test('AntigravityEngineAdapter: executeStream yields typed EngineEvent flow throughout subprocess lifecycle', async () => {
  const tempBrainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy_test_brain_'));
  const testSessionId = 'test-session-uuid-123';
  const transcriptDir = path.join(tempBrainDir, testSessionId, '.system_generated', 'logs');
  fs.mkdirSync(transcriptDir, { recursive: true });

  const transcriptContent = [
    JSON.stringify({ type: 'USER_INPUT', content: 'hello' }),
    JSON.stringify({ type: 'PLANNER_RESPONSE', content: 'Resposta final do CEO testada com sucesso.' }),
  ].join('\n');
  fs.writeFileSync(path.join(transcriptDir, 'transcript.jsonl'), transcriptContent);

  const mockSpawn = () => {
    const mockChild = new EventEmitter();
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();

    setImmediate(() => {
      mockChild.stdout.emit('data', Buffer.from(`{"event":"init","conversation_id":"${testSessionId}"}\n`));
      mockChild.stdout.emit('data', Buffer.from('{"event":"step_update","step_update":{"subagent_info":{"subagents":[{"role":"CTO","conversation_id":"sub-1"}]}}}\n'));
      mockChild.stdout.emit('data', Buffer.from('{"event":"step_update","step_update":{"step_type":"agent_response","conversation_id":"sub-1","text_delta":"Trabalhando..."}}\n'));
      mockChild.emit('close', 0);
    });

    return mockChild;
  };

  const adapter = new AntigravityEngineAdapter({
    brainDir: tempBrainDir,
    agyBin: 'node',
    spawnFn: mockSpawn,
  });

  const instruction = new EngineInstructionDTO({
    prompt: 'teste stream',
    workspaceDir: tempBrainDir,
  });

  const receivedEvents = [];
  try {
    for await (const event of adapter.executeStream(instruction)) {
      receivedEvents.push(event);
    }

    assert.equal(receivedEvents[0].type, 'SESSION_BOUND');
    assert.equal(receivedEvents[0].payload.sessionId, testSessionId);

    assert.equal(receivedEvents[1].type, 'SUBAGENT_DISCOVERED');
    assert.equal(receivedEvents[1].payload.typeName, 'CTO');

    assert.equal(receivedEvents[2].type, 'TEXT_DELTA_EMITTED');
    assert.equal(receivedEvents[2].payload.textChunk, 'Trabalhando...');

    assert.equal(receivedEvents[3].type, 'EXECUTION_COMPLETED');
    assert.equal(receivedEvents[3].payload.result.responseText, 'Resposta final do CEO testada com sucesso.');
  } finally {
    try { fs.rmSync(tempBrainDir, { recursive: true, force: true }); } catch {}
  }
});
