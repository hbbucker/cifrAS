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
  parseRetryAfterSeconds,
} = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');
const { EngineInstructionDTO } = require('../../../src/domain/dtos/EngineInstructionDTO');
const { AntigravityStreamParser } = require('../../../src/adapters/engines/antigravity/AntigravityStreamParser');

function createMockChild(run) {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  setImmediate(() => run(child));
  return child;
}

async function collectExecutionEvents(adapter, sessionId = 'existing-session') {
  const events = [];
  for await (const event of adapter.executeStream(new EngineInstructionDTO({
    prompt: 'test quota flow',
    sessionId,
    workspaceDir: '/tmp',
  }))) {
    events.push(event);
  }
  return events;
}

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
    '--sandbox',
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
    '--sandbox',
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

test('AntigravityEngineAdapter: parses only complete valid reset durations', () => {
  const validCases = new Map([
    ['Resets in 41s', 41],
    ['Resets in 21m41s.', 1301],
    ['Resets in 2h', 7200],
    ['Resets in 2h03m04s', 7384],
    ['Resets in 999h59m59s', 3599999],
  ]);
  for (const [input, expected] of validCases) {
    assert.equal(parseRetryAfterSeconds(input), expected, input);
  }

  for (const input of [
    '',
    'Resets in',
    'Resets in 0s',
    'Resets in 60s',
    'Resets in 60m',
    'Resets in 1000h',
    'Resets in 1m2m',
    'Resets in 1s2m',
    'Resets in 21 minutes',
  ]) {
    assert.equal(parseRetryAfterSeconds(input), null, input);
  }
});

test('AntigravityEngineAdapter: fragmented quota overrides zero exit and old transcript without leaking stderr', async () => {
  let transcriptReads = 0;
  const adapter = new AntigravityEngineAdapter({
    spawnFn: () => createMockChild((child) => {
      child.stdout.emit('data', Buffer.from('{"event":"step_update","step_update":{"status_text":"partial work"}}\n'));
      for (const chunk of [
        'Individual quo',
        'ta reached. Resets ',
        'in 21m',
        '41s. Error ID: 2a2012ac-c0bd-41fc-b2c1-28965d8401cd',
      ]) {
        child.stderr.emit('data', Buffer.from(chunk));
      }
      child.stdout.emit('data', Buffer.from('{"event":"step_update","step_update":{"status_text":"must not escape"}}\n'));
      child.emit('close', 0);
    }),
  });
  adapter.readTranscriptResponse = async () => {
    transcriptReads += 1;
    return 'old transcript response';
  };

  const events = await collectExecutionEvents(adapter);
  const terminalEvents = events.filter((event) => event.type.startsWith('EXECUTION_'));

  assert.equal(transcriptReads, 0);
  assert.equal(terminalEvents.length, 1);
  assert.equal(terminalEvents[0].type, 'EXECUTION_FAILED');
  assert.equal(terminalEvents[0].payload.error.code, 'ENGINE_QUOTA_EXHAUSTED');
  assert.equal(terminalEvents[0].payload.error.retryAfterSeconds, 1301);
  assert.equal(events.some((event) => event.payload.statusText === 'must not escape'), false);
  assert.doesNotMatch(JSON.stringify(terminalEvents[0]), /2a2012ac|Individual quota reached|old transcript/);
});

test('AntigravityEngineAdapter: detects quota across representative signature boundaries', async () => {
  const signature = 'Individual quota reached';
  for (const splitIndex of [4, 13, 18, 21]) {
    const adapter = new AntigravityEngineAdapter({
      spawnFn: () => createMockChild((child) => {
        child.stderr.emit('data', Buffer.from(`prefix ${signature.slice(0, splitIndex)}`));
        child.stderr.emit('data', Buffer.from(`${signature.slice(splitIndex)}. Resets in 41s.`));
        child.emit('close', 0);
      }),
    });

    const events = await collectExecutionEvents(adapter);
    assert.equal(events.at(-1).type, 'EXECUTION_FAILED', `split at ${splitIndex}`);
    assert.equal(events.at(-1).payload.error.retryAfterSeconds, 41, `split at ${splitIndex}`);
  }
});

test('AntigravityEngineAdapter: detects a signature outside the retained tail of a chunk larger than 4 KiB', async () => {
  let transcriptReads = 0;
  const adapter = new AntigravityEngineAdapter({
    spawnFn: () => createMockChild((child) => {
      const oversizedChunk = `Individual quota reached. Resets in 41s.${'x'.repeat(5000)}`;
      child.stderr.emit('data', Buffer.from(oversizedChunk));
      child.emit('close', 0);
    }),
  });
  adapter.readTranscriptResponse = async () => {
    transcriptReads += 1;
    return 'old transcript';
  };

  const events = await collectExecutionEvents(adapter);
  assert.equal(transcriptReads, 0);
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.equal(events.at(-1).payload.error.retryAfterSeconds, 41);
});

test('AntigravityEngineAdapter: detects a signature split at the 4 KiB chunk boundary', async () => {
  const adapter = new AntigravityEngineAdapter({
    spawnFn: () => createMockChild((child) => {
      child.stderr.emit('data', Buffer.from(`${'x'.repeat(4082)}Individual quo`));
      child.stderr.emit('data', Buffer.from(`ta reached.${'y'.repeat(5000)}`));
      child.emit('close', 0);
    }),
  });

  const events = await collectExecutionEvents(adapter);
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.equal(events.at(-1).payload.error.code, 'ENGINE_QUOTA_EXHAUSTED');
});

test('AntigravityEngineAdapter: retains parsed duration after more than 4 KiB of later stderr', async () => {
  const adapter = new AntigravityEngineAdapter({
    spawnFn: () => createMockChild((child) => {
      child.stderr.emit('data', Buffer.from('Individual quota reached. Resets in 2h03m04s.'));
      child.stderr.emit('data', Buffer.from('z'.repeat(5000)));
      child.emit('close', 1);
    }),
  });

  const events = await collectExecutionEvents(adapter);
  assert.equal(events.at(-1).payload.error.retryAfterSeconds, 7384);
});

test('AntigravityEngineAdapter: competing terminal events flush and close the queue only once', async () => {
  const originalParserCreate = AntigravityStreamParser.create;
  const originalQueueClose = AsyncEventQueue.prototype.close;

  for (const terminalOrder of [['error', 'close'], ['close', 'error']]) {
    let flushCount = 0;
    let closeCount = 0;
    AntigravityStreamParser.create = (onEvent) => {
      const parser = originalParserCreate.call(AntigravityStreamParser, onEvent);
      const originalFlush = parser.flush;
      parser.flush = () => {
        flushCount += 1;
        originalFlush();
      };
      return parser;
    };
    AsyncEventQueue.prototype.close = function instrumentedClose() {
      closeCount += 1;
      return originalQueueClose.call(this);
    };

    try {
      const adapter = new AntigravityEngineAdapter({
        spawnFn: () => createMockChild((child) => {
          child.stderr.emit('data', Buffer.from('Individual quota reached. Individual quota reached.'));
          for (const terminalEvent of terminalOrder) {
            if (terminalEvent === 'error') child.emit('error', new Error('spawn failure'));
            else child.emit('close', 1);
          }
        }),
      });

      const events = await collectExecutionEvents(adapter);
      assert.equal(events.filter((event) => event.type === 'EXECUTION_FAILED').length, 1);
      assert.equal(flushCount, 1, terminalOrder.join(' then '));
      assert.equal(closeCount, 1, terminalOrder.join(' then '));
    } finally {
      AntigravityStreamParser.create = originalParserCreate;
      AsyncEventQueue.prototype.close = originalQueueClose;
    }
  }
});

test('AntigravityEngineAdapter: near match keeps generic failure behavior', async () => {
  let transcriptReads = 0;
  const adapter = new AntigravityEngineAdapter({
    spawnFn: () => createMockChild((child) => {
      child.stderr.emit('data', Buffer.from('individual quota reached'));
      child.emit('close', 2);
    }),
  });
  adapter.readTranscriptResponse = async () => {
    transcriptReads += 1;
    return '';
  };

  const events = await collectExecutionEvents(adapter);
  assert.equal(transcriptReads, 1);
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.notEqual(events.at(-1).payload.error.code, 'ENGINE_QUOTA_EXHAUSTED');
});
