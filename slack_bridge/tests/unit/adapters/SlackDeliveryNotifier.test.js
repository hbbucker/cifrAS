const test = require('node:test');
const assert = require('node:assert/strict');
const { SlackDeliveryNotifier } = require('../../../src/adapters/notifiers/SlackDeliveryNotifier');
const { AgentRole } = require('../../../src/domain/value-objects/AgentRole');

test('SlackDeliveryNotifier: fallback mode sends chat messages when assistant is unavailable', async () => {
  const postedMessages = [];
  const mockSlackClient = {
    chat: {
      postMessage: async (payload) => {
        postedMessages.push(payload);
        return { ok: true };
      },
    },
    files: {
      uploadV2: async () => ({ ok: true }),
    },
  };

  const notifier = new SlackDeliveryNotifier({ slackClient: mockSlackClient });

  await notifier.sendAcknowledgement('100.200', 'C_CHAN');
  assert.equal(postedMessages.length, 1);
  assert.equal(postedMessages[0].channel, 'C_CHAN');
  assert.equal(postedMessages[0].thread_ts, '100.200');

  await notifier.sendStatus('100.200', 'C_CHAN', 'CEO está analisando a tarefa', { bypassInterval: true });
  assert.equal(postedMessages.length, 2);

  await notifier.sendIntermediateNarrative('100.200', 'C_CHAN', AgentRole.from('CTO'), 'Trabalho em andamento');
  assert.equal(postedMessages.length, 3);
  assert.ok(postedMessages[2].text.includes('CTO'));

  await notifier.sendFinalConsolidation('100.200', 'C_CHAN', AgentRole.from('CEO'), 'Entrega final pronta', []);
  assert.equal(postedMessages.length, 4);

  await notifier.sendErrorMessage('100.200', 'C_CHAN', 'Erro ocorrido');
  assert.equal(postedMessages.length, 5);
});

test('SlackDeliveryNotifier: assistant mode uses assistant.threads.setStatus and cleans up', async () => {
  const postedMessages = [];
  const assistantStatuses = [];
  const mockSlackClient = {
    assistant: {
      threads: {
        setStatus: async (payload) => {
          assistantStatuses.push(payload);
          return { ok: true };
        },
      },
    },
    chat: {
      postMessage: async (payload) => {
        postedMessages.push(payload);
        return { ok: true };
      },
    },
    files: {
      uploadV2: async () => ({ ok: true }),
    },
  };

  const notifier = new SlackDeliveryNotifier({ slackClient: mockSlackClient });

  await notifier.sendAcknowledgement('100.200', 'C_CHAN');
  assert.equal(postedMessages.length, 0, 'No chat message posted when assistant status succeeded');
  assert.equal(assistantStatuses.length, 1);
  assert.equal(assistantStatuses[0].channel_id, 'C_CHAN');
  assert.equal(assistantStatuses[0].thread_ts, '100.200');
  assert.ok(assistantStatuses[0].status.includes('CEO'));

  await notifier.sendStatus('100.200', 'C_CHAN', 'CTO gerando DTOs', { bypassInterval: true });
  assert.equal(postedMessages.length, 0);
  assert.equal(assistantStatuses.length, 2);
  assert.equal(assistantStatuses[1].status, 'CTO gerando DTOs');

  await notifier.sendMilestoneNotification('100.200', 'C_CHAN', AgentRole.from('CTO'), 'DTOs finalizados com sucesso');
  assert.equal(postedMessages.length, 1);
  assert.ok(postedMessages[0].text.includes('DTOs finalizados') || (postedMessages[0].blocks && postedMessages[0].blocks[0].text.text.includes('DTOs finalizados')));

  await notifier.sendFinalConsolidation('100.200', 'C_CHAN', AgentRole.from('CEO'), 'Resultado final pronto', []);
  // Clears status (status: '') and posts final message
  assert.equal(assistantStatuses.length, 3);
  assert.equal(assistantStatuses[2].status, '');
  assert.equal(postedMessages.length, 2);
  assert.ok(postedMessages[1].text.includes('Resultado final pronto') || (postedMessages[1].blocks && postedMessages[1].blocks[0].text.text.includes('Resultado final')));
});
