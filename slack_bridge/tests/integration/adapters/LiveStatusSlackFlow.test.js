const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { SlackDeliveryNotifier } = require('../../../src/adapters/notifiers/SlackDeliveryNotifier');
const { AntigravityEngineAdapter } = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');
const { CodexEngineAdapter } = require('../../../src/adapters/engines/codex/CodexEngineAdapter');
const { ProcessMessageUseCase } = require('../../../src/application/usecases/ProcessMessageUseCase');
const { LiveStatusPolicy, INITIAL_STATUS } = require('../../../src/domain/services/LiveStatusPolicy');
const { EngineEvent } = require('../../../src/domain/events/EngineEvent');
const { TurnResultDTO } = require('../../../src/domain/dtos/TurnResultDTO');
const { EngineQuotaExhaustedError } = require('../../../src/domain/errors/EngineQuotaExhaustedError');

const fixturePath = path.resolve(__dirname, '../../fixtures/stream-json-cli.js');

class MemorySessionRepository {
  constructor() { this.sessions = new Map(); }
  async getByThreadId(threadId) { return this.sessions.get(threadId) || null; }
  async save(session) { this.sessions.set(session.threadId, session); }
}

function createSlackRecorder({ assistantAvailable = true, assistantResult = { ok: true } } = {}) {
  const statuses = [];
  const messages = [];
  const threads = assistantAvailable ? {
    setStatus: async (payload) => {
      statuses.push(payload);
      return assistantResult;
    },
  } : {};
  return {
    statuses,
    messages,
    client: {
      assistant: { threads },
      chat: {
        postMessage: async (payload) => {
          messages.push(payload);
          return { ok: true, ts: `message-${messages.length}` };
        },
        update: async () => ({ ok: true }),
      },
      files: { uploadV2: async () => ({ ok: true }) },
    },
  };
}

function createUseCase({ engine, recorder, now }) {
  return new ProcessMessageUseCase({
    llmEngine: engine,
    notificationGateway: new SlackDeliveryNotifier({
      slackClient: recorder.client,
      liveStatusPolicy: new LiveStatusPolicy({ now }),
    }),
    sessionRepository: new MemorySessionRepository(),
  });
}

test('Live status integration shows fallback, safe engine progress and terminal cleanup', async () => {
  let currentTime = 0;
  const recorder = createSlackRecorder();
  const engine = {
    async *executeStream() {
      yield EngineEvent.sessionBound('session-live-status');
      currentTime = 15_000;
      yield EngineEvent.statusUpdated('session-live-status', 'Analisando a estrutura das cifras…');
      yield EngineEvent.statusUpdated('session-live-status', 'Executando `synthetic-command`');
      yield EngineEvent.executionCompleted(new TurnResultDTO({
        exitCode: 0,
        responseText: 'Análise concluída com segurança.',
        filePaths: [],
      }));
    },
  };
  const useCase = createUseCase({ engine, recorder, now: () => currentTime });

  const result = await useCase.execute({
    threadId: 'thread-live',
    channelId: 'channel-live',
    userText: 'avalie a harmonia desta música',
  });

  assert.equal(result.success, true);
  assert.deepEqual(recorder.statuses.map((payload) => payload.status), [
    INITIAL_STATUS,
    'Analisando a estrutura das cifras...',
    '',
  ]);
  assert.equal(recorder.statuses.every((payload) => [...payload.status].length <= 120), true);
  assert.equal(recorder.messages.some((payload) => payload.text === 'Executando `synthetic-command`'), false);
});

test('Live status integration isolates Assistant API degradation from the final response', async () => {
  let currentTime = 0;
  const recorder = createSlackRecorder({ assistantAvailable: false });
  const engine = {
    async *executeStream() {
      currentTime = 15_000;
      yield EngineEvent.statusUpdated('session-degraded', 'Revisando o processamento da mensagem…');
      yield EngineEvent.executionCompleted(new TurnResultDTO({
        exitCode: 0,
        responseText: 'Resposta final preservada.',
        filePaths: [],
      }));
    },
  };
  const useCase = createUseCase({ engine, recorder, now: () => currentTime });

  const result = await useCase.execute({
    threadId: 'thread-degraded',
    channelId: 'channel-live',
    userText: 'prossiga com a análise',
  });

  assert.equal(result.success, true);
  assert.equal(recorder.messages.filter((payload) => payload.text === INITIAL_STATUS).length, 0);
  assert.equal(recorder.messages.some((payload) => payload.text.includes('Revisando o processamento')), false);
  assert.equal(recorder.messages.some((payload) => payload.text.includes('Resposta final preservada')), true);
});

test('Live status integration cleans up quota, error, timeout and cancellation without provider diagnostics', async () => {
  const terminalErrors = [
    new EngineQuotaExhaustedError(60),
    new Error('synthetic failure'),
    new Error('Turn execution timed out after 300000ms'),
    new Error('Engine execution cancelled'),
  ];
  for (const error of terminalErrors) {
    const recorder = createSlackRecorder();
    const engine = {
      async *executeStream() {
        yield EngineEvent.executionFailed(error, 1);
      },
    };
    const useCase = createUseCase({ engine, recorder, now: () => 0 });
    const result = await useCase.execute({
      threadId: `thread-error-${error.name}`,
      channelId: 'channel-live',
      userText: 'execute o fluxo',
    });

    assert.equal(result.success, false);
    assert.equal(recorder.statuses.at(-1).status, '');
    assert.equal(recorder.messages.length, 1);
    assert.doesNotMatch(JSON.stringify(recorder.messages), /synthetic failure/);
  }
});

test('Live status integration keeps concurrent thread state independent', async () => {
  let currentTime = 0;
  const recorder = createSlackRecorder();
  const notifier = new SlackDeliveryNotifier({
    slackClient: recorder.client,
    liveStatusPolicy: new LiveStatusPolicy({ now: () => currentTime }),
  });

  await notifier.sendAcknowledgement('thread-a', 'channel-live');
  await notifier.sendAcknowledgement('thread-b', 'channel-live');
  currentTime = 15_000;
  await notifier.sendStatus('thread-a', 'channel-live', 'Analisando o fluxo A…', { source: 'engine' });
  await notifier.sendStatus('thread-b', 'channel-live', 'Revisando o fluxo B…', { source: 'engine' });
  await notifier.sendErrorMessage('thread-a', 'channel-live', 'Erro seguro');
  currentTime = 30_000;
  await notifier.sendStatus('thread-b', 'channel-live', 'Testando o fluxo B…', { source: 'engine' });

  const threadAStatuses = recorder.statuses.filter((payload) => payload.thread_ts === 'thread-a');
  const threadBStatuses = recorder.statuses.filter((payload) => payload.thread_ts === 'thread-b');
  assert.equal(threadAStatuses.at(-1).status, '');
  assert.equal(threadBStatuses.at(-1).status, 'Testando o fluxo B...');
});

test('Live status local smoke carries process fixtures through both engines and Slack boundary', async () => {
  const engineCases = [
    ['codex-success', CodexEngineAdapter, 'codex-fixture-session'],
    ['antigravity-success', AntigravityEngineAdapter, 'agy-fixture-session'],
  ];
  for (const [fixtureMode, Adapter, expectedSessionId] of engineCases) {
    const recorder = createSlackRecorder();
    const engine = new Adapter({
      spawnFn: (_command, _args, options) => spawn(process.execPath, [fixturePath, fixtureMode], options),
    });
    const useCase = createUseCase({ engine, recorder, now: Date.now });
    const result = await useCase.execute({
      threadId: `thread-process-${fixtureMode}`,
      channelId: 'channel-live',
      userText: 'execute o smoke local',
    });

    assert.equal(result.success, true);
    assert.equal(result.sessionId, expectedSessionId);
    assert.equal(recorder.statuses[0].status, INITIAL_STATUS);
    assert.equal(recorder.statuses.at(-1).status, '');
    assert.equal(recorder.statuses.some((payload) => /^(?:Tools|Tool|Executando):/.test(payload.status)), false);
    assert.equal(recorder.statuses.every((payload) => [...payload.status].length <= 120), true);
  }
});
