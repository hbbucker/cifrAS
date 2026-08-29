const fs = require('node:fs');
const path = require('node:path');
const { default: PQueue } = require('p-queue');
const { INotificationPort } = require('../../domain/ports/INotificationPort');
const { SlackMrkdwnFormatter } = require('../formatters/SlackMrkdwnFormatter');

const STATUS_INTERVAL_MS = 15_000;
const ACKNOWLEDGEMENT_STATUS = 'CEO entendeu a solicitação e está avaliando o encaminhamento.';

class SlackDeliveryNotifier extends INotificationPort {
  constructor({ slackClient, formatter = new SlackMrkdwnFormatter() }) {
    super();
    this.client = slackClient;
    this.formatter = formatter;
    this.queues = new Map();
    this.lastStatusByThread = new Map();
  }

  _getQueue(threadId) {
    if (!this.queues.has(threadId)) {
      this.queues.set(threadId, new PQueue({ concurrency: 1 }));
    }
    return this.queues.get(threadId);
  }

  async setAssistantStatus(threadId, channelId, statusText) {
    if (this.client?.assistant?.threads?.setStatus && typeof this.client.assistant.threads.setStatus === 'function') {
      try {
        await this.client.assistant.threads.setStatus({
          channel_id: channelId,
          thread_ts: threadId,
          status: statusText || '',
        });
        return true;
      } catch (err) {
        if (global.logDebug) global.logDebug('assistant_set_status_failed');
        return false;
      }
    }
    return false;
  }

  async sendAcknowledgement(threadId, channelId) {
    const queue = this._getQueue(threadId);
    return queue.add(async () => {
      const assistantUpdated = await this.setAssistantStatus(threadId, channelId, ACKNOWLEDGEMENT_STATUS);
      if (!assistantUpdated) {
        try {
          await this.client.chat.postMessage({
            channel: channelId,
            thread_ts: threadId,
            text: ACKNOWLEDGEMENT_STATUS,
          });
        } catch (err) {
          if (global.logDebug) global.logDebug('ack_failed');
        }
      }
    });
  }

  async sendStatus(threadId, channelId, statusText, options = {}) {
    const cleanStatus = this.formatter.redactLocalPaths(statusText)
      .replace(/[\n*_`#]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const now = Date.now();
    const last = this.lastStatusByThread.get(threadId) || { text: '', at: 0 };

    if (!cleanStatus || cleanStatus === last.text) return false;
    if (!options.bypassInterval && now - last.at < STATUS_INTERVAL_MS) return false;

    this.lastStatusByThread.set(threadId, { text: cleanStatus, at: now });

    const queue = this._getQueue(threadId);
    return queue.add(async () => {
      const assistantUpdated = await this.setAssistantStatus(threadId, channelId, cleanStatus);
      if (!assistantUpdated) {
        try {
          await this.client.chat.postMessage({
            channel: channelId,
            thread_ts: threadId,
            text: cleanStatus,
          });
        } catch (err) {
          if (global.logDebug) global.logDebug('status_failed');
        }
      }
    });
  }

  async sendIntermediateNarrative(threadId, channelId, agentRole, markdownText) {
    // Evita envio de pedaços quebrados de texto para a thread.
    // Atualiza status do assistente sem poluição visual.
    const statusText = `${agentRole.formattedName} em atividade...`;
    return this.sendStatus(threadId, channelId, statusText, { bypassInterval: true });
  }

  async sendMilestoneNotification(threadId, channelId, agentRole, markdownText) {
    const queue = this._getQueue(threadId);
    
    const { filePaths: extractedFiles, markdown: cleanMarkdown } = this.formatter.extractLocalFiles(markdownText);
    
    const header = `*${agentRole.formattedName} — marco concluído*`;
    const formattedBody = this.formatter.format(cleanMarkdown);
    const fullMessage = `${header}\n\n${formattedBody}`;

    return queue.add(async () => {
      await this._postMessageBlock(channelId, threadId, fullMessage);
      await this._uploadFiles(channelId, threadId, extractedFiles);
    });
  }

  async sendFinalConsolidation(threadId, channelId, agentRole, markdownText, filePaths = []) {
    const queue = this._getQueue(threadId);
    
    const { filePaths: extractedFiles, markdown: cleanMarkdown } = this.formatter.extractLocalFiles(markdownText);
    const allFiles = [...new Set([...(filePaths || []), ...extractedFiles])];
    
    const header = `*${agentRole.formattedName} — consolidação*`;
    const formattedBody = this.formatter.format(cleanMarkdown);
    const fullMessage = `${header}\n\n${formattedBody}`;

    return queue.add(async () => {
      // Limpa status do Slack Assistant ao concluir
      await this.setAssistantStatus(threadId, channelId, '');

      await this._postMessageBlock(channelId, threadId, fullMessage);
      await this._uploadFiles(channelId, threadId, allFiles);
    });
  }

  async _uploadFiles(channelId, threadId, filePaths) {
    if (!filePaths || filePaths.length === 0) return;
    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) continue;
      try {
        await this.client.files.uploadV2({
          channel_id: channelId,
          thread_ts: threadId,
          file: fs.createReadStream(filePath),
          filename: path.basename(filePath),
        });
      } catch (err) {
        if (global.logDebug) global.logDebug('file_upload_failed');
      }
    }
  }

  async sendErrorMessage(threadId, channelId, errorText) {
    const queue = this._getQueue(threadId);
    return queue.add(async () => {
      await this.setAssistantStatus(threadId, channelId, '');
      try {
        await this.client.chat.postMessage({
          channel: channelId,
          thread_ts: threadId,
          text: errorText,
        });
      } catch {}
    });
  }

  async _postMessageBlock(channelId, threadId, markdown) {
    const fallback = this.formatter.createAccessibleFallback(markdown) || 'Atualização';
    const chunks = this.formatter.splitMarkdownForSlack(markdown);

    for (const chunk of chunks) {
      const payload = {
        channel: channelId,
        thread_ts: threadId,
        text: fallback,
        blocks: [{ type: 'section', text: { type: 'mrkdwn', text: chunk.slice(0, 3000) } }],
      };
      try {
        await this.client.chat.postMessage(payload);
      } catch (err) {
        await this.client.chat.postMessage({ channel: channelId, thread_ts: threadId, text: chunk });
      }
    }
  }
}

module.exports = { SlackDeliveryNotifier, STATUS_INTERVAL_MS, ACKNOWLEDGEMENT_STATUS };
