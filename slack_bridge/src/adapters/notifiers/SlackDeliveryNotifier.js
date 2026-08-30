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
    this.streamBuffers = new Map();
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

    async streamNarrative(threadId, channelId, agentRole, textChunk) {
    if (!textChunk) return;

    const streamKey = `${threadId}:${agentRole.name}`;
    
    if (!this.streamBuffers.has(streamKey)) {
      this.streamBuffers.set(streamKey, {
        buffer: '',
        ts: null,
        lastUpdate: 0,
        timeoutId: null,
        isCreating: false
      });
    }

    const streamObj = this.streamBuffers.get(streamKey);
    streamObj.buffer += textChunk;
    
    if (!streamObj.ts && !streamObj.isCreating) {
      streamObj.isCreating = true;
      const header = `*${agentRole.formattedName}*`;
      const initialText = `${header}\n\n_Digitando..._`;

      // Bypass queue to get 'ts' immediately
      this.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadId,
        text: initialText,
      }).then(result => {
        streamObj.ts = result.ts;
        streamObj.isCreating = false;
        // Flush immediately once created
        this._flushStream(streamKey, threadId, channelId, agentRole);
      }).catch(err => {
        streamObj.isCreating = false;
      });
      return;
    }

    this._scheduleStreamFlush(streamKey, threadId, channelId, agentRole, 1500);
  }

  _scheduleStreamFlush(streamKey, threadId, channelId, agentRole, intervalMs) {
     const streamObj = this.streamBuffers.get(streamKey);
     // Se ainda não tem ts (está criando), o then() do postMessage fará o flush.
     // Se já tem um timeoutId rodando, aguarda ele.
     if (!streamObj || !streamObj.ts || streamObj.timeoutId) return;

     const now = Date.now();
     const timeSinceLastUpdate = now - streamObj.lastUpdate;

     if (timeSinceLastUpdate >= intervalMs) {
       this._flushStream(streamKey, threadId, channelId, agentRole);
     } else {
       const remaining = intervalMs - timeSinceLastUpdate;
       streamObj.timeoutId = setTimeout(() => {
         this._flushStream(streamKey, threadId, channelId, agentRole);
       }, remaining);
     }
  }

  _flushStream(streamKey, threadId, channelId, agentRole) {
     const streamObj = this.streamBuffers.get(streamKey);
     if (!streamObj || !streamObj.ts || !streamObj.buffer) return;

     const textToFlush = streamObj.buffer;
     const header = `*${agentRole.formattedName}*`;
     const formattedBody = this.formatter.format(textToFlush) + ' ✍️';
     
     const fullMessage = `${header}\n\n${formattedBody}`;
     const chunks = this.formatter.splitMarkdownForSlack(fullMessage);
     const chunkToUpdate = chunks[0];
     
     streamObj.lastUpdate = Date.now();
     streamObj.timeoutId = null;

     if (global.logDebug) global.logDebug('SLACK FLUSHING STREAM:', streamKey, 'Buffer size:', textToFlush.length);

     // Fire and forget, bypassing PQueue for absolute minimum latency
     this.client.chat.update({
       channel: channelId,
       ts: streamObj.ts,
       text: 'Atualização',
       blocks: [{ type: 'section', text: { type: 'mrkdwn', text: chunkToUpdate.slice(0, 3000) } }]
     }).catch(err => {
       if (global.logDebug) global.logDebug('stream_flush_failed', err.message);
     });
  }

  async sendPrimaryResponse(threadId, channelId, agentRole, markdownText) {
    const queue = this._getQueue(threadId);
    
    const { filePaths: extractedFiles, markdown: cleanMarkdown } = this.formatter.extractLocalFiles(markdownText);
    
    const header = `*${agentRole.formattedName}*`;
    const formattedBody = this.formatter.format(cleanMarkdown);
    const fullMessage = `${header}\n\n${formattedBody}`;
    
    const streamKey = `${threadId}:${agentRole.name}`;
    const streamObj = this.streamBuffers.get(streamKey);

    return queue.add(async () => {
      await this.setAssistantStatus(threadId, channelId, '');
      
      if (streamObj && streamObj.ts) {
        if (streamObj.timeoutId) clearTimeout(streamObj.timeoutId);
        
        const fallback = this.formatter.createAccessibleFallback(fullMessage) || 'Atualização';
        const chunks = this.formatter.splitMarkdownForSlack(fullMessage);
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const payload = {
            channel: channelId,
            ts: i === 0 ? streamObj.ts : undefined,
            thread_ts: i === 0 ? undefined : threadId,
            text: fallback,
            blocks: [{ type: 'section', text: { type: 'mrkdwn', text: chunk.slice(0, 3000) } }],
          };
          try {
            if (i === 0) {
              await this.client.chat.update(payload);
            } else {
              await this.client.chat.postMessage(payload);
            }
          } catch (err) {}
        }
        this.streamBuffers.delete(streamKey);
      } else {
        await this._postMessageBlock(channelId, threadId, fullMessage);
      }
      
      await this._uploadFiles(channelId, threadId, extractedFiles);
    });
  }

  async sendFinalConsolidation(threadId, channelId, agentRole, markdownText, filePaths = []) {
    const queue = this._getQueue(threadId);
    
    const { filePaths: extractedFiles, markdown: cleanMarkdown } = this.formatter.extractLocalFiles(markdownText || '');
    const allFiles = [...new Set([...(filePaths || []), ...extractedFiles])];
    
    const formattedBody = this.formatter.format(cleanMarkdown);
    let fullMessage = '';
    if (formattedBody.trim()) {
      const header = `*${agentRole.formattedName} — consolidação*`;
      fullMessage = `${header}\n\n${formattedBody}`;
    }

    return queue.add(async () => {
      // Limpa status do Slack Assistant ao concluir
      await this.setAssistantStatus(threadId, channelId, '');

      if (fullMessage) {
        await this._postMessageBlock(channelId, threadId, fullMessage);
      }
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
    if (global.logDebug) global.logDebug('SLACK POST BLOCK:', markdown.substring(0, 100).replace(/\n/g, ' '));
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
