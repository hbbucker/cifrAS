const test = require('node:test');
const assert = require('node:assert/strict');
const { SlackEventController } = require('../../../src/adapters/controllers/SlackEventController');

test('SlackEventController: registers message handler and forwards messages to use case', async () => {
  let executedParams = null;
  const mockUseCase = {
    execute: async (params) => {
      executedParams = params;
    },
  };

  const controller = new SlackEventController({ processMessageUseCase: mockUseCase });

  let registeredHandler = null;
  const mockSlackApp = {
    event: (eventName, handler) => {
      if (eventName === 'message') registeredHandler = handler;
    },
  };

  controller.register(mockSlackApp);
  assert.ok(registeredHandler);

  // Simula evento do Slack de usuário humano
  await registeredHandler({
    event: {
      text: 'Olá mundo',
      thread_ts: '123.456',
      channel: 'C_CHAN',
    },
  });

  assert.ok(executedParams);
  assert.equal(executedParams.threadId, '123.456');
  assert.equal(executedParams.channelId, 'C_CHAN');
  assert.equal(executedParams.userText, 'Olá mundo');

  // Simula evento de bot (deve ignorar)
  executedParams = null;
  await registeredHandler({
    event: {
      text: 'Mensagem de bot',
      bot_id: 'B123',
    },
  });
  assert.equal(executedParams, null);
});
