const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { AntigravityEngineAdapter, parseRetryAfterSeconds, MAX_ACTIVE_STEPS } = require(
  '../../../src/adapters/engines/antigravity/AntigravityEngineAdapter'
);
const { EngineInstructionDTO } = require('../../../src/domain/dtos/EngineInstructionDTO');

const fixturePath = path.resolve(__dirname, '../../fixtures/stream-json-cli.js');

function createChild(run) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => {};
  setImmediate(() => run(child));
  return child;
}

async function collect(adapter, sessionId = 'existing-session') {
  const events = [];
  for await (const event of adapter.executeStream(new EngineInstructionDTO({
    prompt: 'safe fixture', sessionId, workspaceDir: '/tmp',
  }))) events.push(event);
  return events;
}

function emitClose(child, code = 0) {
  child.emit('exit', code, null);
  child.emit('close', code, null);
}

test('AntigravityEngineAdapter preserves AGY flags including sandbox', () => {
  const adapter = new AntigravityEngineAdapter();
  const args = adapter.buildCliArgs({ prompt: 'Olá', sessionId: 'session-1', workspaceDir: '/work' });
  assert.deepEqual(args, ['-p', 'Olá', '--add-dir', '/work', '--conversation', 'session-1',
    '--print-timeout', '1h', '--dangerously-skip-permissions', '--sandbox', '--output-format', 'stream-json']);
});

test('AntigravityEngineAdapter translates init, step events and result.response', async () => {
  const adapter = new AntigravityEngineAdapter({ spawnFn: () => createChild((child) => {
    const records = [
      { event: 'init', conversation_id: 'session-current' },
      { event: 'step_update', step_update: { subagent_info: { subagents: [
        { conversation_id: 'sub-1', role: 'CTO', secret: 'not-public' },
      ] } } },
      { event: 'step_update', step_update: { step_type: 'agent_response', conversation_id: 'sub-1',
        step_index: 2, state: 'DONE', text_delta: 'feito' } },
      { event: 'result', result: { status: 'SUCCESS', response: 'terminal response' } },
    ];
    child.stdout.write(records.map((record) => JSON.stringify(record)).join('\n') + '\n');
    emitClose(child);
  }) });
  const events = await collect(adapter, null);
  assert.deepEqual(events.map((event) => event.type), [
    'SESSION_BOUND', 'SUBAGENT_DISCOVERED', 'TEXT_DELTA_EMITTED', 'MILESTONE_COMPLETED', 'EXECUTION_COMPLETED',
  ]);
  assert.equal(events.at(-1).payload.result.responseText, 'terminal response');
  assert.doesNotMatch(JSON.stringify(events), /not-public/);
});

test('AntigravityEngineAdapter rejects failed or missing response terminal safely', async () => {
  for (const result of [{ status: 'FAILED', response: 'vendor secret' }, { status: 'SUCCESS' }]) {
    const adapter = new AntigravityEngineAdapter({ spawnFn: () => createChild((child) => {
      child.stdout.write(`${JSON.stringify({ event: 'result', result })}\n`);
      emitClose(child, result.status === 'FAILED' ? 1 : 0);
    }) });
    const events = await collect(adapter);
    assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
    assert.doesNotMatch(JSON.stringify(events), /vendor secret/);
  }
});

test('AntigravityEngineAdapter quota overrides result and historical transcript', async () => {
  const brainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-history-'));
  const transcriptDir = path.join(brainDir, 'existing-session', '.system_generated', 'logs');
  fs.mkdirSync(transcriptDir, { recursive: true });
  fs.writeFileSync(path.join(transcriptDir, 'transcript.jsonl'), JSON.stringify({
    type: 'PLANNER_RESPONSE', content: 'old response',
  }));
  const adapter = new AntigravityEngineAdapter({ brainDir, spawnFn: () => createChild((child) => {
    child.stdout.write(`${JSON.stringify({ event: 'result', result: {
      status: 'SUCCESS', response: 'candidate response',
    } })}\n`);
    child.stderr.write('Individual quo');
    child.stderr.write('ta reached. Resets in 21m41s. Error ID: secret-id');
    emitClose(child);
  }) });
  try {
    const events = await collect(adapter);
    assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
    assert.equal(events.at(-1).payload.error.code, 'ENGINE_QUOTA_EXHAUSTED');
    assert.equal(events.at(-1).payload.error.retryAfterSeconds, 1301);
    assert.doesNotMatch(JSON.stringify(events), /old response|candidate response|secret-id|Individual quota/);
  } finally { fs.rmSync(brainDir, { recursive: true, force: true }); }
});

test('AntigravityEngineAdapter lets quota observed during terminal grace override success', async () => {
  const adapter = new AntigravityEngineAdapter({
    runnerOptions: { terminalGraceMs: 40 },
    spawnFn: () => createChild((child) => {
      child.stdout.write(`${JSON.stringify({ event: 'result', result: {
        status: 'SUCCESS', response: 'must not complete',
      } })}\n`);
      setTimeout(() => child.stderr.write('Individual quota reached. Resets in 41s.'), 10);
      setTimeout(() => emitClose(child), 20);
    }),
  });
  const events = await collect(adapter);
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.equal(events.at(-1).payload.error.code, 'ENGINE_QUOTA_EXHAUSTED');
  assert.equal(events.at(-1).payload.error.retryAfterSeconds, 41);
  assert.doesNotMatch(JSON.stringify(events), /must not complete|Individual quota/);
});

if (process.platform !== 'win32') {
  test('AntigravityEngineAdapter lets first quota during success cleanup override once', async () => {
    const adapter = new AntigravityEngineAdapter({
      spawnFn: () => spawn(process.execPath, [fixturePath, 'antigravity-success-then-cleanup-quota'], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
      runnerOptions: { terminalGraceMs: 10, terminationGraceMs: 100, cleanupConfirmMs: 200 },
    });
    const events = await collect(adapter);
    assert.deepEqual(events.map((event) => event.type), ['EXECUTION_FAILED']);
    assert.equal(events[0].payload.error.code, 'ENGINE_QUOTA_EXHAUSTED');
    assert.equal(events[0].payload.error.retryAfterSeconds, 41);
    assert.doesNotMatch(JSON.stringify(events), /must not complete|Individual quota/);
  });
}

test('AntigravityEngineAdapter rejects stdout partial events received after quota recognition', async () => {
  const adapter = new AntigravityEngineAdapter({
    runnerOptions: { platform: 'win32' },
    spawnFn: () => createChild((child) => {
      child.stderr.write('Individual quota reached. Resets in 41s.');
      child.stdout.write(`${JSON.stringify({ event: 'step_update', step_update: {
        status_text: 'must-not-be-published',
      } })}\n`);
      emitClose(child);
    }),
  });
  const events = await collect(adapter);
  assert.deepEqual(events.map((event) => event.type), ['EXECUTION_FAILED']);
  assert.equal(events[0].payload.error.code, 'ENGINE_QUOTA_EXHAUSTED');
  assert.equal(events[0].payload.error.retryAfterSeconds, 41);
  assert.doesNotMatch(JSON.stringify(events), /must-not-be-published/);
});

test('AntigravityEngineAdapter returns only files appended after correlated cursor', async () => {
  const brainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-cursor-'));
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-files-'));
  const sessionId = 'session-files';
  const transcriptDir = path.join(brainDir, sessionId, '.system_generated', 'logs');
  const transcriptPath = path.join(transcriptDir, 'transcript.jsonl');
  const historicalFile = path.join(workDir, 'historical.md');
  const currentFile = path.join(workDir, 'current.md');
  fs.mkdirSync(transcriptDir, { recursive: true });
  fs.writeFileSync(historicalFile, 'old');
  fs.writeFileSync(currentFile, 'new');
  fs.writeFileSync(transcriptPath, `${JSON.stringify({ tool_calls: [{ args: { TargetFile: historicalFile } }] })}\n`);
  const adapter = new AntigravityEngineAdapter({ brainDir, spawnFn: () => createChild((child) => {
    fs.appendFileSync(transcriptPath, `${JSON.stringify({ tool_calls: [{ args: { TargetFile: currentFile } }] })}\n`);
    child.stdout.write(`${JSON.stringify({ event: 'result', result: {
      status: 'SUCCESS', response: 'done',
    } })}\n`);
    emitClose(child);
  }) });
  try {
    const events = await collect(adapter, sessionId);
    assert.deepEqual(events.at(-1).payload.result.filePaths, [currentFile]);
  } finally {
    fs.rmSync(brainDir, { recursive: true, force: true });
    fs.rmSync(workDir, { recursive: true, force: true });
  }
});

test('AntigravityEngineAdapter enforces active step and step byte limits', async () => {
  const adapter = new AntigravityEngineAdapter();
  const context = { boundSessionId: 'root', stepBuffers: new Map() };
  for (let index = 0; index < MAX_ACTIVE_STEPS; index += 1) {
    await adapter.translateRecord({ event: 'step_update', step_update: {
      step_type: 'agent_response', conversation_id: 'root', step_index: index, text_delta: 'x',
    } }, context);
  }
  await assert.rejects(adapter.translateRecord({ event: 'step_update', step_update: {
    step_type: 'agent_response', conversation_id: 'root', step_index: 129, text_delta: 'x',
  } }, context), { code: 'ENGINE_PROTOCOL_STATE_LIMIT' });
  await assert.rejects(adapter.translateRecord({ event: 'step_update', step_update: {
    step_type: 'agent_response', conversation_id: 'root', step_index: 0, text_delta: 'x'.repeat(4 * 1024 * 1024),
  } }, { boundSessionId: 'root', stepBuffers: new Map([['root:0', 'x']]) }),
  { code: 'ENGINE_PROTOCOL_STATE_LIMIT' });
});

test('AntigravityEngineAdapter parses only complete quota reset durations', () => {
  assert.equal(parseRetryAfterSeconds('Resets in 2h03m04s'), 7384);
  assert.equal(parseRetryAfterSeconds('Resets in 60m'), null);
  assert.equal(parseRetryAfterSeconds('Resets in 0s'), null);
});
