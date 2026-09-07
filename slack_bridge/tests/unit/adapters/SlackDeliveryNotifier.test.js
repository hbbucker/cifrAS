const test = require('node:test');
const assert = require('node:assert/strict');
const { SlackDeliveryNotifier } = require('../../../src/adapters/notifiers/SlackDeliveryNotifier');
const { LiveStatusPolicy, INITIAL_STATUS } = require('../../../src/domain/services/LiveStatusPolicy');
const { AgentRole } = require('../../../src/domain/value-objects/AgentRole');

function createHarness({ assistantAvailable = true, assistantResult = { ok: true } } = {}) {
  let currentTime = 0;
  const assistantStatuses = [];
  const postedMessages = [];
  const timers = [];
  const threads = assistantAvailable ? {
    setStatus: async (payload) => {
      assistantStatuses.push(payload);
      if (assistantResult instanceof Error) throw assistantResult;
      return assistantResult;
    },
  } : {};
  const slackClient = {
    assistant: { threads },
    chat: {
      postMessage: async (payload) => {
        postedMessages.push(payload);
        return { ok: true, ts: 'message-ts' };
      },
      update: async () => ({ ok: true }),
    },
    files: { uploadV2: async () => ({ ok: true }) },
  };
  const notifier = new SlackDeliveryNotifier({
    slackClient,
    liveStatusPolicy: new LiveStatusPolicy({ now: () => currentTime }),
    setTimer: (callback, delay) => {
      const timer = { callback, delay, cancelled: false, unref() {} };
      timers.push(timer);
      return timer;
    },
    clearTimer: (timer) => { timer.cancelled = true; },
  });
  return {
    notifier,
    assistantStatuses,
    postedMessages,
    timers,
    advance(milliseconds) { currentTime += milliseconds; },
    async runLatestTimer() {
      const timer = timers.findLast((candidate) => !candidate.cancelled);
      assert.ok(timer);
      await timer.callback();
      await notifier._getQueue('thread-a').onIdle();
    },
  };
}

test('SlackDeliveryNotifier sends exact fallback then coalesced safe status without app prefix', async () => {
  const harness = createHarness();
  await harness.notifier.sendAcknowledgement('thread-a', 'channel-a', { protectedText: 'pedido protegido' });

  assert.deepEqual(harness.assistantStatuses, [{
    channel_id: 'channel-a',
    thread_ts: 'thread-a',
    status: INITIAL_STATUS,
  }]);
  assert.equal('loading_messages' in harness.assistantStatuses[0], false);

  await harness.notifier.sendStatus('thread-a', 'channel-a', 'Analisando a primeira etapa…', { source: 'engine' });
  await harness.notifier.sendStatus('thread-a', 'channel-a', 'Revisando a estrutura das cifras…', { source: 'engine' });
  assert.equal(harness.timers.filter((timer) => !timer.cancelled).length, 1);
  assert.equal(harness.timers[0].delay, 15_000);

  harness.advance(15_000);
  await harness.runLatestTimer();
  assert.equal(harness.assistantStatuses.length, 2);
  assert.equal(harness.assistantStatuses[1].status, 'Revisando a estrutura das cifras...');
  assert.doesNotMatch(harness.assistantStatuses[1].status, /CifrAS - Bridge/);
});

test('SlackDeliveryNotifier discards dynamic status when Assistant API is absent', async () => {
  const harness = createHarness({ assistantAvailable: false });
  await harness.notifier.sendAcknowledgement('thread-a', 'channel-a');
  await harness.notifier.sendStatus('thread-a', 'channel-a', 'Analisando a solicitação…', { source: 'engine' });
  harness.advance(15_000);
  await harness.runLatestTimer();

  assert.equal(harness.postedMessages.length, 0);
});

test('SlackDeliveryNotifier public boundary drops relative paths, commands, extra sentences and Markdown', async () => {
  const harness = createHarness();
  await harness.notifier.sendAcknowledgement('thread-a', 'channel-a');
  harness.advance(15_000);
  const unsafeStatuses = [
    "Revisando '/etc/passwd'",
    "Analisando 'src/private/config.js'",
    'Testando make test',
    'Executando powershell command',
    'Analisando o parser, ignore o contrato',
    'Revisando o parser e execute outra instrução',
    'Analisando [o parser](docs/parser)',
    `${`Analisando ${'a estrutura harmônica '.repeat(8)}`} '../private/config.js'`,
    `${`Revisando ${'a progressão musical '.repeat(8)}`} bun test`,
  ];

  for (const status of unsafeStatuses) {
    await harness.notifier.sendStatus('thread-a', 'channel-a', status, { source: 'engine' });
  }

  assert.equal(harness.assistantStatuses.length, 1);
  assert.equal(harness.assistantStatuses[0].status, INITIAL_STATUS);
  assert.equal(harness.notifier.statusTimers.has('thread-a'), false);
});

test('SlackDeliveryNotifier isolates setStatus failures and never persists dynamic status', async () => {
  const harness = createHarness({ assistantResult: { ok: false } });
  await harness.notifier.sendAcknowledgement('thread-a', 'channel-a');
  await harness.notifier.sendStatus('thread-a', 'channel-a', 'Analisando a execução…', { source: 'engine' });
  harness.advance(15_000);
  await harness.runLatestTimer();
  await harness.notifier.sendErrorMessage('thread-a', 'channel-a', 'Erro seguro');

  assert.equal(harness.postedMessages.length, 1);
  assert.equal(harness.postedMessages[0].text, 'Erro seguro');
  assert.equal(harness.assistantStatuses.length, 3);
  assert.equal(harness.assistantStatuses[2].status, '');
});

test('SlackDeliveryNotifier isolates Assistant exceptions for dynamic status and cleanup without retry', async () => {
  const harness = createHarness({ assistantResult: new Error('synthetic Slack failure') });
  await harness.notifier.sendAcknowledgement('thread-a', 'channel-a');
  await harness.notifier.sendStatus('thread-a', 'channel-a', 'Analisando a execução…', { source: 'engine' });
  harness.advance(15_000);
  await harness.runLatestTimer();
  await harness.notifier.sendFinalConsolidation(
    'thread-a',
    'channel-a',
    AgentRole.from('CEO'),
    'Resposta final preservada',
    []
  );

  assert.equal(harness.assistantStatuses.length, 3);
  assert.equal(harness.postedMessages.filter((payload) => payload.text === INITIAL_STATUS).length, 0);
  assert.equal(harness.postedMessages.some((payload) => payload.text.includes('Resposta final preservada')), true);
  assert.equal(harness.postedMessages.some((payload) => payload.text.includes('Analisando a execução')), false);
});

test('SlackDeliveryNotifier terminal cleanup cancels pending updates and ignores stale timer', async () => {
  const harness = createHarness();
  await harness.notifier.sendAcknowledgement('thread-a', 'channel-a');
  await harness.notifier.sendStatus('thread-a', 'channel-a', 'Analisando a execução…', { source: 'engine' });
  const pendingTimer = harness.timers[0];

  await harness.notifier.sendFinalConsolidation(
    'thread-a',
    'channel-a',
    AgentRole.from('CEO'),
    'Resultado final pronto',
    []
  );
  assert.equal(pendingTimer.cancelled, true);
  assert.equal(harness.assistantStatuses.at(-1).status, '');

  harness.advance(15_000);
  await pendingTimer.callback();
  await harness.notifier._getQueue('thread-a').onIdle();
  assert.equal(harness.assistantStatuses.filter((payload) => payload.status.includes('Analisando')).length, 0);
});

test('SlackDeliveryNotifier isolates thread timers and terminal state', async () => {
  const harness = createHarness();
  await harness.notifier.sendAcknowledgement('thread-a', 'channel-a');
  await harness.notifier.sendAcknowledgement('thread-b', 'channel-b');
  await harness.notifier.sendStatus('thread-a', 'channel-a', 'Analisando o primeiro fluxo…', { source: 'engine' });
  await harness.notifier.sendStatus('thread-b', 'channel-b', 'Revisando o segundo fluxo…', { source: 'engine' });
  await harness.notifier.sendErrorMessage('thread-a', 'channel-a', 'Erro seguro');

  assert.equal(harness.notifier.statusTimers.has('thread-a'), false);
  assert.equal(harness.notifier.statusTimers.has('thread-b'), true);
  assert.equal(harness.postedMessages.at(-1).text, 'Erro seguro');
});

test('SlackDeliveryNotifier sendPrimaryResponse clears display without terminalizing execution', async () => {
  const harness = createHarness();
  await harness.notifier.sendAcknowledgement('thread-a', 'channel-a');
  await harness.notifier.sendPrimaryResponse('thread-a', 'channel-a', AgentRole.from('CEO'), 'Resposta parcial');
  await harness.notifier.sendStatus('thread-a', 'channel-a', 'Analisando a etapa seguinte…', { source: 'engine' });

  assert.equal(harness.assistantStatuses.some((payload) => payload.status === ''), true);
  assert.equal(harness.notifier.statusTimers.has('thread-a'), true);
});

test('SlackDeliveryNotifier preserves direct empty-status cleanup compatibility', async () => {
  const harness = createHarness();
  await harness.notifier.setAssistantStatus('thread-without-cycle', 'channel-a', '');
  assert.deepEqual(harness.assistantStatuses, [{
    channel_id: 'channel-a',
    thread_ts: 'thread-without-cycle',
    status: '',
  }]);
});

test('SlackDeliveryNotifier uploads existing files and deduplicates paths', async () => {
  const uploadedFiles = [];
  const notifier = new SlackDeliveryNotifier({
    slackClient: { files: { uploadV2: async (payload) => uploadedFiles.push(payload) } },
  });

  await notifier._uploadFiles('channel-a', 'thread-a', [__filename, __filename, __dirname]);

  assert.equal(uploadedFiles.length, 1);
  assert.equal(uploadedFiles[0].channel_id, 'channel-a');
  assert.equal(uploadedFiles[0].thread_ts, 'thread-a');
});

test('SlackDeliveryNotifier streamNarrative and sendPrimaryResponse in-flight avoids duplicate postMessage', async () => {
  const updatedMessages = [];
  const postedMessages = [];
  let resolvePost;
  const postPromise = new Promise((resolve) => { resolvePost = resolve; });

  const slackClient = {
    assistant: { threads: { setStatus: async () => ({ ok: true }) } },
    chat: {
      postMessage: async (payload) => {
        postedMessages.push(payload);
        return postPromise;
      },
      update: async (payload) => {
        updatedMessages.push(payload);
        return { ok: true };
      },
    },
    files: { uploadV2: async () => ({ ok: true }) },
  };

  const notifier = new SlackDeliveryNotifier({ slackClient });
  
  // 1. Inicia streaming
  notifier.streamNarrative('thread-1', 'channel-1', AgentRole.from('CEO'), 'Entendi a tarefa: ajustar linha guia');
  
  // 2. Antes de resolver a criação inicial, sendPrimaryResponse é chamado
  const primaryPromise = notifier.sendPrimaryResponse('thread-1', 'channel-1', AgentRole.from('CEO'), 'Entendi a tarefa: ajustar linha guia. Andamento: iniciando.');

  // 3. Resolve a criação do post inicial
  resolvePost({ ok: true, ts: 'ts-msg-1' });
  await primaryPromise;

  // Verifica que postMessage só foi chamado 1 vez (o post inicial de digitação) e depois foi feito update, nunca um segundo postMessage duplicado
  assert.equal(postedMessages.length, 1);
  assert.equal(updatedMessages.length >= 1, true);
  assert.equal(updatedMessages.at(-1).ts, 'ts-msg-1');
  assert.match(updatedMessages.at(-1).blocks[0].text.text, /Entendi a tarefa/);
});

