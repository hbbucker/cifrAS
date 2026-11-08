const { App } = require('@slack/bolt');
const { EnvironmentConfig } = require('./config/EnvironmentConfig');
const { JsonFileThreadRepository } = require('../adapters/repositories/JsonFileThreadRepository');
const { SlackMrkdwnFormatter } = require('../adapters/formatters/SlackMrkdwnFormatter');
const { SlackDeliveryNotifier } = require('../adapters/notifiers/SlackDeliveryNotifier');
const { AntigravityEngineAdapter } = require('../adapters/engines/antigravity/AntigravityEngineAdapter');
const { MockEngineAdapter } = require('../adapters/engines/mock/MockEngineAdapter');
const { CodexEngineAdapter } = require('../adapters/engines/codex/CodexEngineAdapter');
const { ProcessMessageUseCase } = require('../application/usecases/ProcessMessageUseCase');
const { SlackEventController } = require('../adapters/controllers/SlackEventController');

function createEngine(engineName) {
  switch (String(engineName || '').toLowerCase()) {
    case 'codex':
      return new CodexEngineAdapter();
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

  app.error(async (error) => {
    console.error('[Slack Bolt App Error]', error);
    if (global.logDebug) global.logDebug('bolt_app_error', error.message || error);
  });

  if (app.receiver && app.receiver.client) {
    const socketClient = app.receiver.client;

    socketClient.on('connected', () => {
      console.log('⚡ [Slack SocketMode] Conexão WebSocket estabelecida com sucesso.');
      if (global.logDebug) global.logDebug('socket_connected');
    });

    socketClient.on('reconnecting', () => {
      console.warn('⚠️ [Slack SocketMode] Reconectando WebSocket...');
      if (global.logDebug) global.logDebug('socket_reconnecting');
    });

    socketClient.on('disconnected', () => {
      console.warn('⚠️ [Slack SocketMode] WebSocket desconectado. Tentando reconexão ativa...');
      if (global.logDebug) global.logDebug('socket_disconnected');
      setTimeout(() => {
        try {
          if (typeof socketClient.reconnect === 'function') {
            socketClient.reconnect();
          }
        } catch (err) {
          if (global.logDebug) global.logDebug('socket_reconnect_error', err.message);
        }
      }, 1000).unref?.();
    });

    socketClient.on('unable_to_socket_mode_start', (err) => {
      console.error('❌ [Slack SocketMode] Falha ao iniciar Socket Mode:', err);
      if (global.logDebug) global.logDebug('unable_to_socket_mode_start', err.message);
    });

    socketClient.on('error', (err) => {
      console.error('❌ [Slack SocketMode Client Error]:', err);
      if (global.logDebug) global.logDebug('socket_client_error', err.message);
    });
  }

  const formatter = new SlackMrkdwnFormatter();
  const notifier = new SlackDeliveryNotifier({
    slackClient: app.client,
    formatter,
    workspaceDir: config.workspaceDir,
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
    allowedChannelId: config.allowedChannelId,
  });

  controller.register(app);

  await app.start();
  const pkg = require('../../package.json');
  console.log(`⚡ Slack Bridge v${pkg.version} is running cleanly with Clean Architecture!`);
  if (global.logDebug) global.logDebug('bridge_started');

  return { app, processMessageUseCase };
}

module.exports = { bootstrap, createEngine };
