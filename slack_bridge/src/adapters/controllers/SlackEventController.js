const { default: PQueue } = require('p-queue');

class SlackEventController {
  constructor({ processMessageUseCase }) {
    this.processMessageUseCase = processMessageUseCase;
    this.threadQueues = new Map();
  }

  _getThreadQueue(threadId) {
    if (!this.threadQueues.has(threadId)) {
      this.threadQueues.set(threadId, new PQueue({ concurrency: 1 }));
    }
    return this.threadQueues.get(threadId);
  }

  register(slackApp) {
    slackApp.event('message', async ({ event }) => {
      // Ignora mensagens enviadas por bots ou subtipos que não sejam envio de arquivos
      if (event.bot_id || (event.subtype && event.subtype !== 'file_share')) {
        return;
      }

      const threadId = event.thread_ts || event.ts;
      const channelId = event.channel;
      const userText = (event.text || '').trim() || 'O usuário enviou um anexo para análise.';

      const queue = this._getThreadQueue(threadId);
      queue.add(async () => {
        try {
          await this.processMessageUseCase.execute({
            threadId,
            channelId,
            userText,
          });
        } catch (error) {
          if (global.logDebug) global.logDebug('unhandled_controller_error');
        }
      });
    });
  }
}

module.exports = { SlackEventController };
