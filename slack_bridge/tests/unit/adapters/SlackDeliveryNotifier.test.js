const test = require('node:test');
const assert = require('node:assert/strict');
const { SlackDeliveryNotifier } = require('../../../src/adapters/notifiers/SlackDeliveryNotifier');
const { AgentRole } = require('../../../src/domain/value-objects/AgentRole');

test('SlackDeliveryNotifier: sends ack, status, narrative and final message', async () => {
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
  assert.ok(postedMessages[2].text.includes('Trabalho em andamento'));

  await notifier.sendFinalConsolidation('100.200', 'C_CHAN', AgentRole.from('CEO'), 'Entrega final pronta', []);
  assert.equal(postedMessages.length, 4);

  await notifier.sendErrorMessage('100.200', 'C_CHAN', 'Erro ocorrido');
  assert.equal(postedMessages.length, 5);
});
