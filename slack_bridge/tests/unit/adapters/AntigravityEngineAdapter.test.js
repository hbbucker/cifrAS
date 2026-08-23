const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { EventEmitter } = require('node:events');
const {
  AntigravityEngineAdapter,
  DEFAULT_BRAIN_DIR,
  TRANSCRIPT_RELATIVE_PATH,
} = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');

test('AntigravityEngineAdapter: buildCliArgs generates correct flag array with and without sessionId', () => {
  const adapter = new AntigravityEngineAdapter();

  // Sem sessionId
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

  // Com sessionId
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

test('AntigravityEngineAdapter: translateStreamEvent correctly maps NDJSON events to callbacks', () => {
  const adapter = new AntigravityEngineAdapter();
  const context = { boundSessionId: 'root-123' };

  let sessionBoundResult = null;
  let subagentDiscoveredResult = null;
  let streamDeltaResult = null;
  let statusUpdateResult = null;

  const callbacks = {
    onSessionBound: (res) => { sessionBoundResult = res; },
    onSubagentDiscovered: (res) => { subagentDiscoveredResult = res; },
    onStreamDelta: (res) => { streamDeltaResult = res; },
    onStatusUpdate: (res) => { statusUpdateResult = res; },
  };

  // 1. Evento init
  adapter.translateStreamEvent({ event: 'init', conversation_id: 'session-bound-999' }, callbacks, context);
  assert.equal(context.boundSessionId, 'session-bound-999');
  assert.deepEqual(sessionBoundResult, { sessionId: 'session-bound-999' });

  // 2. Evento subagent_info
  adapter.translateStreamEvent({
    event: 'step_update',
    step_update: {
      subagent_info: {
        subagents: [{ conversation_id: 'sub-456', role: 'CTO', type_name: 'startupos-cto' }],
      },
    },
  }, callbacks, context);
  assert.equal(subagentDiscoveredResult.conversationId, 'sub-456');
  assert.equal(subagentDiscoveredResult.typeName, 'CTO');

  // 3. Evento agent_response
  adapter.translateStreamEvent({
    event: 'step_update',
    step_update: {
      step_type: 'agent_response',
      conversation_id: 'sub-456',
      text_delta: 'Configurando migrations...',
    },
  }, callbacks, context);
  assert.deepEqual(streamDeltaResult, {
    conversationId: 'sub-456',
    textChunk: 'Configurando migrations...',
  });

  // 4. Evento status_text
  adapter.translateStreamEvent({
    event: 'step_update',
    step_update: {
      status_text: 'Executando comando no terminal',
    },
  }, callbacks, context);
  assert.deepEqual(statusUpdateResult, {
    conversationId: 'session-bound-999',
    statusText: 'Executando comando no terminal',
  });
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

    // Sessão inexistente deve retornar string vazia sem lançar exceção
    const emptyResult = await adapter.readTranscriptResponse('non-existent-session');
    assert.equal(emptyResult, '');
  } finally {
    fs.rmSync(tempBrainDir, { recursive: true, force: true });
  }
});

test('AntigravityEngineAdapter: execute orchestrates full subprocess lifecycle with injected methods', async () => {
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

  let boundSession = null;
  let discoveredSubagent = null;
  let streamedDelta = null;

  try {
    const result = await adapter.execute(
      { prompt: 'teste', workspaceDir: tempBrainDir },
      {
        onSessionBound: (payload) => { boundSession = payload; },
        onSubagentDiscovered: (payload) => { discoveredSubagent = payload; },
        onStreamDelta: (payload) => { streamedDelta = payload; },
      }
    );

    assert.equal(result.exitCode, 0);
    assert.deepEqual(boundSession, { sessionId: testSessionId });
    assert.equal(discoveredSubagent.conversationId, 'sub-1');
    assert.equal(discoveredSubagent.typeName, 'CTO');
    assert.deepEqual(streamedDelta, { conversationId: 'sub-1', textChunk: 'Trabalhando...' });
    assert.equal(result.responseText, 'Resposta final do CEO testada com sucesso.');
  } finally {
    try { fs.rmSync(tempBrainDir, { recursive: true, force: true }); } catch {}
  }
});
