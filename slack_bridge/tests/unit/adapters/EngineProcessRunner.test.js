const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { EngineProcessRunner } = require('../../../src/adapters/engines/shared/EngineProcessRunner');
const { EngineEvent } = require('../../../src/domain/events/EngineEvent');

const fixturePath = path.resolve(__dirname, '../../fixtures/stream-json-cli.js');

function translateFixtureRecord(record) {
  if (record.type === 'message') {
    return { events: [EngineEvent.textDeltaEmitted('fixture', record.text)], terminal: null };
  }
  if (record.type === 'done') {
    return {
      events: [],
      terminal: { kind: 'success', responseText: record.response, error: null, protocolType: 'done' },
    };
  }
  return null;
}

async function collect(runner, mode, overrides = {}) {
  const events = [];
  for await (const event of runner.execute({
    engine: 'fixture',
    command: process.execPath,
    args: [fixturePath, mode],
    cwd: process.cwd(),
    env: { ...process.env },
    translateRecord: translateFixtureRecord,
    ...overrides,
  })) events.push(event);
  return events;
}

test('EngineProcessRunner preserves fragmented UTF-8 and emits one final terminal', async () => {
  const runner = new EngineProcessRunner({ terminalGraceMs: 20 });
  const events = await collect(runner, 'success');
  assert.equal(events[0].type, 'TEXT_DELTA_EMITTED');
  assert.equal(events[0].payload.textChunk, 'ação 🚀');
  assert.equal(events.at(-1).type, 'EXECUTION_COMPLETED');
  assert.equal(events.at(-1).payload.result.responseText, 'fixture complete');
  assert.equal(events.filter((event) => event.type.startsWith('EXECUTION_')).length, 1);
});

test('EngineProcessRunner treats zero close without terminal as protocol failure', async () => {
  const events = await collect(new EngineProcessRunner(), 'missing-terminal');
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.equal(events.at(-1).payload.error.code, 'ENGINE_PROTOCOL_TERMINAL_MISSING');
});

test('EngineProcessRunner treats nonzero exit as safe process failure', async () => {
  const events = await collect(new EngineProcessRunner(), 'nonzero');
  assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
  assert.equal(events.at(-1).payload.error.code, 'ENGINE_PROCESS_FAILURE');
});

test('EngineProcessRunner redacts malformed content from result and metrics', async () => {
  const events = await collect(new EngineProcessRunner(), 'secret-malformed');
  assert.equal(events.at(-1).type, 'EXECUTION_COMPLETED');
  assert.equal(events.at(-1).payload.result.metrics.malformedLineCount, 1);
  assert.doesNotMatch(JSON.stringify(events), /secret-fixture-value/);
});

test('EngineProcessRunner timeout wins once and uses process state instead of child.killed', async () => {
  const signals = [];
  const spawnFn = () => {
    const child = new EventEmitter();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.killed = true;
    child.kill = (signal) => { signals.push(signal); };
    return child;
  };
  const runner = new EngineProcessRunner({
    spawnFn,
    platform: 'win32',
    inactivityTimeoutMs: 15,
    maxTurnTimeoutMs: 100,
  });
  const events = await collect(runner, 'unused');
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'EXECUTION_FAILED');
  assert.equal(events[0].payload.error.code, 'ENGINE_PROCESS_TIMEOUT');
  assert.deepEqual(signals, ['SIGTERM']);
});

test('EngineProcessRunner cancellation stops the owned process without terminal publication', async () => {
  const signals = [];
  const spawnFn = () => {
    const child = new EventEmitter();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = (signal) => signals.push(signal);
    setImmediate(() => child.stdout.write(`${JSON.stringify({ type: 'message', text: 'first' })}\n`));
    return child;
  };
  const runner = new EngineProcessRunner({ spawnFn, platform: 'win32' });
  const iterable = runner.execute({
    engine: 'fixture', command: 'unused', args: [], cwd: process.cwd(), env: {},
    translateRecord: translateFixtureRecord,
  });
  const iterator = iterable[Symbol.asyncIterator]();
  const first = await iterator.next();
  assert.equal(first.value.type, 'TEXT_DELTA_EMITTED');
  await iterator.return();
  assert.deepEqual(signals, ['SIGTERM']);
});

test('EngineProcessRunner escalates its own POSIX process group from SIGTERM to SIGKILL', async () => {
  const runner = new EngineProcessRunner({
    terminalGraceMs: 10,
    terminationGraceMs: 30,
    cleanupConfirmMs: 200,
  });
  const events = await collect(runner, 'ignore-term-descendant');
  assert.equal(events.at(-1).type, 'EXECUTION_COMPLETED');
  const metrics = events.at(-1).payload.result.metrics;
  assert.equal(metrics.cleanupStrategy, 'process_group');
  assert.equal(metrics.cleanupSignal, 'SIGKILL');
  assert.equal(metrics.cleanupForced, true);
  assert.equal(metrics.cleanupConfirmed, true);
});
