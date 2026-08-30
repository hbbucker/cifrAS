const { App } = require('@slack/bolt');
const { EnvironmentConfig } = require('./config/EnvironmentConfig');
const { JsonFileThreadRepository } = require('../adapters/repositories/JsonFileThreadRepository');
const { SlackMrkdwnFormatter } = require('../adapters/formatters/SlackMrkdwnFormatter');
const { SlackDeliveryNotifier } = require('../adapters/notifiers/SlackDeliveryNotifier');
const { AntigravityEngineAdapter } = require('../adapters/engines/antigravity/AntigravityEngineAdapter');
const { MockEngineAdapter } = require('../adapters/engines/mock/MockEngineAdapter');
const { ProcessMessageUseCase } = require('../application/usecases/ProcessMessageUseCase');
const { SlackEventController } = require('../adapters/controllers/SlackEventController');

function createEngine(engineName) {
  switch (String(engineName || '').toLowerCase()) {
    case 'mock':
      return new MockEngineAdapter();
    case 'antigravity':
    default:
      return new AntigravityEngineAdapter();
  }
}

async function bootstrap() {
  const config = EnvironmentConfig.load();
  if (config.isDebug) {
    global.logDebug = (...args) => console.log(`[DEBUG ${new Date().toISOString()}]`, ...args);
    console.log('[DEBUG] Debug mode enabled');
  }

  if (!config.slackBotToken || !config.slackAppToken) {
    throw new Error('Missing SLACK_BOT_TOKEN or SLACK_APP_TOKEN in environment configuration');
  }

  const app = new App({
    token: config.slackBotToken,
    appToken: config.slackAppToken,
    socketMode: true,
  });

  const formatter = new SlackMrkdwnFormatter();
  const notifier = new SlackDeliveryNotifier({
    slackClient: app.client,
    formatter,
  });
  const repository = new JsonFileThreadRepository();
  const engine = createEngine(config.llmEngine);

  const processMessageUseCase = new ProcessMessageUseCase({
    llmEngine: engine,
    notificationGateway: notifier,
    sessionRepository: repository,
    workspaceDir: config.workspaceDir,
  });

  const controller = new SlackEventController({
    processMessageUseCase,
  });

  controller.register(app);

  await app.start();
  const pkg = require('../../package.json');
  console.log(`⚡ Slack Bridge v${pkg.version} is running cleanly with Clean Architecture!`);
  if (global.logDebug) global.logDebug('bridge_started');

  return { app, processMessageUseCase };
}

module.exports = { bootstrap, createEngine };
