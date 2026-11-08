const fs = require('node:fs');
const path = require('node:path');
const { default: PQueue } = require('p-queue');
const { INotificationPort } = require('../../domain/ports/INotificationPort');
const {
  LiveStatusPolicy,
  INITIAL_STATUS,
  STATUS_INTERVAL_MS,
} = require('../../domain/services/LiveStatusPolicy');
const { SlackMrkdwnFormatter } = require('../formatters/SlackMrkdwnFormatter');

const ACKNOWLEDGEMENT_STATUS = INITIAL_STATUS;

class SlackDeliveryNotifier extends INotificationPort {
  constructor({
    slackClient,
    formatter = new SlackMrkdwnFormatter(),
    workspaceDir = process.cwd(),
    liveStatusPolicy = new LiveStatusPolicy(),
    setTimer = setTimeout,
    clearTimer = clearTimeout,
  } = {}) {
    super();
    this.client = slackClient;
    this.formatter = formatter;
    this.workspaceDir = workspaceDir;
    this.liveStatusPolicy = liveStatusPolicy;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.queues = new Map();
    this.statusTimers = new Map();
    this.streamBuffers = new Map();
  }

  _getQueue(threadId) {
    if (!this.queues.has(threadId)) {
      this.queues.set(threadId, new PQueue({ concurrency: 1 }));
    }
    return this.queues.get(threadId);
  }

  async setAssistantStatus(threadId, channelId, statusText) {
    if (!statusText) return this._finishStatus(threadId, channelId, { force: true });
    return this.sendStatus(threadId, channelId, statusText, { source: 'engine' });
  }

  async sendAcknowledgement(threadId, channelId, { protectedText = '' } = {}) {
    this._cancelStatusTimer(threadId);
    const decision = this.liveStatusPolicy.start(threadId, { protectedText });
    return this._dispatchStatusDecision(threadId, channelId, decision, { allowPersistentFallback: false });
  }

  async sendStatus(threadId, channelId, statusText, options = {}) {
    const decision = this.liveStatusPolicy.evaluate(threadId, statusText, {
      source: options.source || 'engine',
    });
    return this._dispatchStatusDecision(threadId, channelId, decision);
  }

  _dispatchStatusDecision(threadId, channelId, decision, { allowPersistentFallback = false } = {}) {
    if (decision.type === 'ignore') return Promise.resolve(false);
    if (decision.type === 'schedule') {
      this._scheduleStatus(threadId, channelId, decision);
      return Promise.resolve(false);
    }

    const queue = this._getQueue(threadId);
    return queue.add(async () => {
      const attempt = this.liveStatusPolicy.prepareAttempt(threadId, decision.identity, decision.candidate);
      if (attempt.type === 'ignore') return false;
      if (attempt.type === 'schedule') {
        this._scheduleStatus(threadId, channelId, attempt);
        return false;
      }
      const assistantUpdated = await this._callAssistantStatus(threadId, channelId, attempt.candidate.text);
      if (assistantUpdated) {
        this.liveStatusPolicy.recordSuccessfulDisplay(threadId, decision.identity, attempt.candidate);
        return true;
      }
      if (allowPersistentFallback) await this._postFallbackAcknowledgement(threadId, channelId);
      return false;
    });
  }

  _scheduleStatus(threadId, channelId, decision) {
    const currentTimer = this.statusTimers.get(threadId);
    if (currentTimer && currentTimer.identity === decision.identity && currentTimer.dueAt === decision.dueAt) return;
    this._cancelStatusTimer(threadId);

    const delay = Math.max(0, decision.delayMs);
    let timerId;
    timerId = this.setTimer(() => {
      const activeTimer = this.statusTimers.get(threadId);
      if (!activeTimer || activeTimer.timerId !== timerId) return;
      this.statusTimers.delete(threadId);
      const pendingDecision = this.liveStatusPolicy.consumePending(threadId, decision.identity);
      this._dispatchStatusDecision(threadId, channelId, pendingDecision).catch(() => {});
    }, delay);
    if (timerId?.unref) timerId.unref();
    this.statusTimers.set(threadId, { timerId, identity: decision.identity, dueAt: decision.dueAt });
  }

  _cancelStatusTimer(threadId) {
    const timer = this.statusTimers.get(threadId);
    if (!timer) return;
    this.clearTimer(timer.timerId);
    this.statusTimers.delete(threadId);
  }

  async _callAssistantStatus(threadId, channelId, statusText) {
    const setStatus = this.client?.assistant?.threads?.setStatus;
    if (typeof setStatus !== 'function') return false;
    try {
      const response = await setStatus.call(this.client.assistant.threads, {
        channel_id: channelId,
        thread_ts: threadId,
        status: statusText,
      });
      if (response?.ok === false) {
        if (global.logDebug) global.logDebug(statusText ? 'live_status_set_failed' : 'live_status_clear_failed');
        return false;
      }
      return true;
    } catch {
      if (global.logDebug) global.logDebug(statusText ? 'live_status_set_failed' : 'live_status_clear_failed');
      return false;
    }
  }

  async _postFallbackAcknowledgement(threadId, channelId) {
    try {
      await this.client?.chat?.postMessage?.({
        channel: channelId,
        thread_ts: threadId,
        text: ACKNOWLEDGEMENT_STATUS,
      });
    } catch {
      if (global.logDebug) global.logDebug('live_status_fallback_post_failed');
    }
  }

  _finishStatus(threadId, channelId, { force = false } = {}) {
    const decision = this.liveStatusPolicy.finish(threadId);
    this._cancelStatusTimer(threadId);
    if (decision.type === 'ignore' && !force) return Promise.resolve(false);

    const queue = this._getQueue(threadId);
    return queue.add(() => this._callAssistantStatus(threadId, channelId, ''));
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
        createPromise: null,
      });
    }

    const streamObj = this.streamBuffers.get(streamKey);
    streamObj.buffer += textChunk;
    
    if (!streamObj.ts && !streamObj.createPromise) {
      const header = `*${agentRole.formattedName}*`;
      const initialText = `${header}\n\n_Digitando..._`;

      // Bypass queue to get 'ts' immediately
      streamObj.createPromise = this.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadId,
        text: initialText,
      }).then(result => {
        streamObj.ts = result?.ts || null;
        // Flush immediately once created if buffer is still present
        if (this.streamBuffers.has(streamKey)) {
          this._flushStream(streamKey, threadId, channelId, agentRole);
        }
        return streamObj.ts;
      }).catch(err => {
        if (global.logDebug) global.logDebug('stream_create_failed', err?.message);
        return null;
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

  async sendMilestoneNotification(threadId, channelId, agentRole, markdownText) {
    const queue = this._getQueue(threadId);
    const { filePaths: extractedFiles, markdown: cleanMarkdown } = this.formatter.extractLocalFiles(markdownText || '', { workspaceDir: this.workspaceDir });
    const header = `*${agentRole.formattedName}*`;
    const formattedBody = this.formatter.format(cleanMarkdown);
    const fullMessage = `${header}\n\n${formattedBody}`;

    return queue.add(async () => {
      await this._postMessageBlock(channelId, threadId, fullMessage);
      await this._uploadFiles(channelId, threadId, extractedFiles);
    });
  }

  async sendIntermediateNarrative(threadId, channelId, agentRole, markdownText) {
    const queue = this._getQueue(threadId);
    const { filePaths: extractedFiles, markdown: cleanMarkdown } = this.formatter.extractLocalFiles(markdownText || '', { workspaceDir: this.workspaceDir });
    const header = `*${agentRole.formattedName}*`;
    const formattedBody = this.formatter.format(cleanMarkdown);
    const fullMessage = `${header}\n\n${formattedBody}`;

    return queue.add(async () => {
      await this._postMessageBlock(channelId, threadId, fullMessage);
      await this._uploadFiles(channelId, threadId, extractedFiles);
    });
  }

  async sendPrimaryResponse(threadId, channelId, agentRole, markdownText) {
    const queue = this._getQueue(threadId);
    
    const { filePaths: extractedFiles, markdown: cleanMarkdown } = this.formatter.extractLocalFiles(markdownText, { workspaceDir: this.workspaceDir });
    
    const header = `*${agentRole.formattedName}*`;
    const formattedBody = this.formatter.format(cleanMarkdown);
    const fullMessage = `${header}\n\n${formattedBody}`;
    
    const streamKey = `${threadId}:${agentRole.name}`;
    const streamObj = this.streamBuffers.get(streamKey);

    return queue.add(async () => {
      await this._callAssistantStatus(threadId, channelId, '');
      this.liveStatusPolicy.markDisplayCleared(threadId);

      let targetTs = streamObj?.ts;
      if (!targetTs && streamObj?.createPromise) {
        targetTs = await streamObj.createPromise;
      }
      
      if (streamObj && streamObj.timeoutId) {
        clearTimeout(streamObj.timeoutId);
        streamObj.timeoutId = null;
      }
      this.streamBuffers.delete(streamKey);

      if (targetTs) {
        const fallback = this.formatter.createAccessibleFallback(fullMessage) || 'Atualização';
        const chunks = this.formatter.splitMarkdownForSlack(fullMessage);
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const payload = {
            channel: channelId,
            ts: i === 0 ? targetTs : undefined,
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
      } else {
        await this._postMessageBlock(channelId, threadId, fullMessage);
      }
      
      await this._uploadFiles(channelId, threadId, extractedFiles);
    });
  }

  async sendFinalConsolidation(threadId, channelId, agentRole, markdownText, filePaths = []) {
    const streamKey = `${threadId}:${agentRole.name}`;
    const streamObj = this.streamBuffers.get(streamKey);
    if (streamObj?.timeoutId) {
      clearTimeout(streamObj.timeoutId);
    }
    this.streamBuffers.delete(streamKey);

    const { filePaths: extractedFiles, markdown: cleanMarkdown } = this.formatter.extractLocalFiles(markdownText || '', { workspaceDir: this.workspaceDir });
    const allFiles = [...new Set([...(filePaths || []), ...extractedFiles])];
    
    const formattedBody = this.formatter.format(cleanMarkdown);
    let fullMessage = '';
    if (formattedBody.trim()) {
      const header = `*${agentRole.formattedName} — consolidação*`;
      fullMessage = `${header}\n\n${formattedBody}`;
    }

    const cleanup = this._finishStatus(threadId, channelId);
    const queue = this._getQueue(threadId);
    return queue.add(async () => {
      await cleanup;

      if (fullMessage) {
        await this._postMessageBlock(channelId, threadId, fullMessage);
      }
      await this._uploadFiles(channelId, threadId, allFiles);
    });
  }

  async _uploadFiles(channelId, threadId, filePaths) {
    if (!filePaths || filePaths.length === 0) return;
    const uniqueFiles = [...new Set(filePaths)];
    for (const filePath of uniqueFiles) {
      try {
        if (!fs.existsSync(filePath)) continue;
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;

        if (this.client?.files?.uploadV2 && typeof this.client.files.uploadV2 === 'function') {
          await this.client.files.uploadV2({
            channel_id: channelId,
            thread_ts: threadId,
            file: fs.createReadStream(filePath),
            filename: path.basename(filePath),
          });
        }
      } catch (err) {
        if (global.logDebug) global.logDebug('file_upload_failed', err?.message || err);
      }
    }
  }

  async sendErrorMessage(threadId, channelId, errorText) {
    const cleanup = this._finishStatus(threadId, channelId);
    const queue = this._getQueue(threadId);
    return queue.add(async () => {
      await cleanup;
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
