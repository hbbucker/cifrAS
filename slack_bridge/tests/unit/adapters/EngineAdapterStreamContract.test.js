const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { AntigravityEngineAdapter } = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');
const { CodexEngineAdapter } = require('../../../src/adapters/engines/codex/CodexEngineAdapter');
const { EngineInstructionDTO } = require('../../../src/domain/dtos/EngineInstructionDTO');

const fixturePath = path.resolve(__dirname, '../../fixtures/stream-json-cli.js');

const engines = [
  {
    name: 'antigravity',
    create: (spawnFn, options = {}) => new AntigravityEngineAdapter({ spawnFn, ...options }),
    records: (response = 'ação 🚀') => [
      { event: 'init', conversation_id: 'session-contract' },
      { event: 'step_update', step_update: { status_text: 'working' } },
      { event: 'result', result: { status: 'SUCCESS', response } },
    ],
    partialRecord: (text) => ({ event: 'step_update', step_update: { status_text: text } }),
    terminalRecords: (response) => [
      { event: 'result', result: { status: 'SUCCESS', response } },
    ],
    cleanupMode: 'antigravity-adapter-ignore-term-descendant',
  },
  {
    name: 'codex',
    create: (spawnFn, options = {}) => new CodexEngineAdapter({ spawnFn, ...options }),
    records: (response = 'ação 🚀') => [
      { type: 'thread.started', thread_id: 'session-contract' },
      { type: 'item.started', item: { type: 'tool_use', tool_name: 'working' } },
      { type: 'item.completed', item: { type: 'agent_message', text: response } },
      { type: 'turn.completed' },
    ],
    partialRecord: (text) => ({ type: 'item.started', item: { type: 'tool_use', tool_name: text } }),
    terminalRecords: (response) => [
      { type: 'item.completed', item: { type: 'agent_message', text: response } },
      { type: 'turn.completed' },
    ],
    cleanupMode: 'codex-adapter-ignore-term-descendant',
  },
];

function childFromBuffer(buffer, { code = 0, split = Math.floor(buffer.length / 2) } = {}) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => {};
  setImmediate(() => {
    child.stdout.write(buffer.subarray(0, split));
    setImmediate(() => {
      child.stdout.write(buffer.subarray(split));
      child.emit('exit', code, null);
      child.emit('close', code, null);
    });
  });
  return child;
}

async function collect(adapter) {
  const events = [];
  for await (const event of adapter.executeStream(new EngineInstructionDTO({
    prompt: 'contract fixture', workspaceDir: '/tmp',
  }))) events.push(event);
  return events;
}

for (const engine of engines) {
  test(`${engine.name} stream contract preserves order, UTF-8 and one final terminal`, async () => {
    const records = [...engine.records(), engine.name === 'antigravity'
      ? { event: 'step_update', step_update: { status_text: 'late-secret-event' } }
      : { type: 'item.started', item: { type: 'tool_use', tool_name: 'late-secret-event' } }];
    const buffer = Buffer.from(records.map((record) => JSON.stringify(record)).join('\r\n') + '\n');
    const multibyteIndex = buffer.indexOf(Buffer.from('🚀')) + 1;
    const events = await collect(engine.create(() => childFromBuffer(buffer, { split: multibyteIndex })));
    assert.equal(events.at(-1).type, 'EXECUTION_COMPLETED');
    assert.equal(events.at(-1).payload.result.responseText, 'ação 🚀');
    assert.equal(events.filter((event) => event.type.startsWith('EXECUTION_')).length, 1);
    assert.equal(events.some((event) => JSON.stringify(event).includes('�')), false);
    assert.doesNotMatch(JSON.stringify(events), /late-secret-event/);
  });

  test(`${engine.name} stream contract continues after malformed and unknown lines`, async () => {
    const validLines = engine.records('safe response').map((record) => JSON.stringify(record));
    validLines.splice(1, 0, '{malformed-secret', JSON.stringify({ unknown: 'secret-record' }), '');
    const events = await collect(engine.create(() => childFromBuffer(Buffer.from(validLines.join('\n') + '\n'))));
    assert.equal(events.at(-1).type, 'EXECUTION_COMPLETED');
    assert.equal(events.at(-1).payload.result.metrics.malformedLineCount, 1);
    assert.equal(events.at(-1).payload.result.metrics.unknownEventCount, 1);
    assert.doesNotMatch(JSON.stringify(events), /malformed-secret|secret-record/);
  });

  test(`${engine.name} stream contract rejects close without terminal and nonzero exit`, async () => {
    for (const code of [0, 4]) {
      const partial = engine.records().slice(0, 1);
      const buffer = Buffer.from(partial.map((record) => JSON.stringify(record)).join('\n') + '\n');
      const events = await collect(engine.create(() => childFromBuffer(buffer, { code })));
      assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
      assert.equal(events.filter((event) => event.type.startsWith('EXECUTION_')).length, 1);
    }
  });

  test(`${engine.name} stream contract times out once and cancels owned child`, async () => {
    const signals = [];
    const spawnFn = () => {
      const child = new EventEmitter();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.kill = (signal) => signals.push(signal);
      return child;
    };
    const events = await collect(engine.create(spawnFn, {
      inactivityTimeoutMs: 15,
      runnerOptions: { platform: 'win32' },
    }));
    assert.equal(events.at(-1).type, 'EXECUTION_FAILED');
    assert.equal(events.at(-1).payload.error.code, 'ENGINE_PROCESS_TIMEOUT');
    assert.deepEqual(signals, ['SIGTERM']);
  });

  test(`${engine.name} stream contract cancels when the consumer abandons iteration`, async () => {
    const signals = [];
    const spawnFn = () => {
      const child = new EventEmitter();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.kill = (signal) => signals.push(signal);
      setImmediate(() => child.stdout.write(`${JSON.stringify(engine.partialRecord('first'))}\n`));
      return child;
    };
    const adapter = engine.create(spawnFn, { runnerOptions: { platform: 'win32' } });
    const iterator = adapter.executeStream(new EngineInstructionDTO({
      prompt: 'contract cancellation', workspaceDir: '/tmp',
    }))[Symbol.asyncIterator]();
    const first = await iterator.next();
    assert.equal(first.done, false);
    assert.equal(first.value.type, 'STATUS_UPDATED');
    await iterator.return();
    assert.deepEqual(signals, ['SIGTERM']);
  });

  test(`${engine.name} stream contract enforces the JSON line byte limit`, async () => {
    const oversizedLine = Buffer.from('x'.repeat(65));
    const events = await collect(engine.create(
      () => childFromBuffer(oversizedLine, { split: oversizedLine.length }),
      { runnerOptions: { platform: 'win32', maxLineBytes: 64 } }
    ));
    assert.deepEqual(events.map((event) => event.type), ['EXECUTION_FAILED']);
    assert.equal(events[0].payload.error.code, 'ENGINE_STREAM_LINE_LIMIT');
  });

  test(`${engine.name} stream contract enforces the individual event byte limit`, async () => {
    const record = engine.partialRecord('x'.repeat(800));
    const buffer = Buffer.from(`${JSON.stringify(record)}\n`);
    const events = await collect(engine.create(
      () => childFromBuffer(buffer, { split: buffer.length }),
      { runnerOptions: { platform: 'win32', maxLineBytes: 2_048,
        queueOptions: { maxEventBytes: 512 } } }
    ));
    assert.deepEqual(events.map((event) => event.type), ['EXECUTION_FAILED']);
    assert.equal(events[0].payload.error.code, 'ENGINE_STREAM_EVENT_LIMIT');
  });

  test(`${engine.name} stream contract applies queue backpressure without loss or reordering`, async () => {
    const statusTexts = ['one', 'two', 'three', 'four'];
    const records = [
      ...statusTexts.map((statusText) => engine.partialRecord(statusText)),
      ...engine.terminalRecords('backpressure response'),
    ];
    const buffer = Buffer.from(records.map(JSON.stringify).join('\n') + '\n');
    const events = await collect(engine.create(
      () => childFromBuffer(buffer, { split: buffer.length }),
      { runnerOptions: { platform: 'win32', queueOptions: {
        maxEvents: 1, lowEvents: 0, maxBytes: 8_192, lowBytes: 0, maxEventBytes: 4_096,
      } } }
    ));
    assert.deepEqual(events.filter((event) => event.type === 'STATUS_UPDATED')
      .map((event) => event.payload.statusText), engine.name === 'antigravity'
      ? statusTexts : statusTexts.map((statusText) => `Tools: ${statusText}`));
    assert.equal(events.at(-1).type, 'EXECUTION_COMPLETED');
    assert.ok(events.at(-1).payload.result.metrics.backpressurePauseCount > 0);
    assert.equal(events.at(-1).payload.result.metrics.maxQueueDepth, 1);
  });

  if (process.platform !== 'win32') {
    test(`${engine.name} stream contract escalates cleanup for a POSIX process group and descendant`, async () => {
      const spawnFixture = () => spawn(process.execPath, [fixturePath, engine.cleanupMode], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const events = await collect(engine.create(spawnFixture, { runnerOptions: {
        terminalGraceMs: 10, terminationGraceMs: 30, cleanupConfirmMs: 200,
      } }));
      assert.equal(events.at(-1).type, 'EXECUTION_COMPLETED');
      const metrics = events.at(-1).payload.result.metrics;
      assert.equal(metrics.cleanupStrategy, 'process_group');
      assert.equal(metrics.cleanupSignal, 'SIGKILL');
      assert.equal(metrics.cleanupForced, true);
      assert.equal(metrics.cleanupConfirmed, true);
    });
  }
}
