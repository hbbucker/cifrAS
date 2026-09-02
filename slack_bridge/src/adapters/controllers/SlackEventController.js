const { default: PQueue } = require('p-queue');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pipeline } = require('node:stream/promises');

class SlackEventController {
  constructor({ processMessageUseCase, allowedChannelId }) {
    this.processMessageUseCase = processMessageUseCase;
    this.threadQueues = new Map();
    this.allowedChannelId = allowedChannelId;
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

      const channelId = event.channel;

      // Filtra pelo ID do canal caso tenha sido configurado (multi-projetos no mesmo workspace)
      if (this.allowedChannelId && channelId !== this.allowedChannelId) {
        return;
      }

      const threadId = event.thread_ts || event.ts;
      let userText = (event.text || '').trim() || 'O usuário enviou um anexo para análise.';

      const queue = this._getThreadQueue(threadId);
      queue.add(async () => {
        const cleanupPaths = [];

        try {
          if (event.files && event.files.length > 0) {
            for (const file of event.files) {
              if (file.mimetype && file.mimetype.startsWith('audio/')) {
                const downloadUrl = file.url_private_download || file.url_private;
                if (!downloadUrl) continue;

                const tmpPath = path.join(os.tmpdir(), `audio_${Date.now()}_${file.name || 'voz.webm'}`);
                
                const response = await fetch(downloadUrl, {
                  headers: {
                    'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
                  }
                });

                if (!response.ok) throw new Error(`Falha no download do áudio: ${response.statusText}`);
                
                const fileStream = fs.createWriteStream(tmpPath);
                await pipeline(response.body, fileStream);
                cleanupPaths.push(tmpPath);

                userText += `\n\n[Mensagem de voz em anexo: ${tmpPath} - Por favor, utilize sua ferramenta view_file para ler este arquivo, ouvir o áudio e responder/processar ao comando que o usuário está te dando]`;
              }
            }
          }

          await this.processMessageUseCase.execute({
            threadId,
            channelId,
            userText,
          });
        } catch (error) {
          if (global.logDebug) global.logDebug('unhandled_controller_error', error);
        } finally {
          for (const tempFile of cleanupPaths) {
            try {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
            } catch (cleanupErr) {
              if (global.logDebug) global.logDebug('audio_cleanup_error', cleanupErr);
            }
          }
        }
      });
    });
  }
}

module.exports = { SlackEventController };
