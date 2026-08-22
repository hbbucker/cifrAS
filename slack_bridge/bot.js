
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { App } = require('@slack/bolt');
const chokidar = require('chokidar');

require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const {
  WORKSPACE_DIR,
  BRAIN_DIR,
  createDebugLogger,
  createPublicationState,
  bindRootSessionFromInit,
  createAgyArguments,
  createRootPrompt,
  createStreamJsonParser,
  parseStreamSubagentEvent,
  applyStreamAgentResponseEvent,
  applyRootTranscriptEvent,
  applySubagentTranscriptEvent,
  beginExecution,
  clearAgentResponseBuffers,
  applyRootTranscriptAtFinish,
  reconcileRootTranscriptDuringExecution,
  extractConversationIds,
  applyNewLines,
  saveMapping
} = require('./agy_execution');

const {
  publishStatus,
  publishIntermediateNarrative,
  publishAcknowledgement,
  publishQueuedStatus,
  publishConsolidation,
  publishFinalWithUploads
} = require('./slack_delivery');

const {
  createConsolidatedFinal
} = require('./message_rendering');

const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const MAPPING_PATH = path.join(__dirname, 'thread_mapping.json');

const logDebug = createDebugLogger();
global.logDebug = logDebug;

function startBridge() {
  if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  const app = new App({ token: process.env.SLACK_BOT_TOKEN, appToken: process.env.SLACK_APP_TOKEN, socketMode: true });
  let mapping = {};
  if (fs.existsSync(MAPPING_PATH)) {
    try { mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8')); } catch { mapping = {}; }
  }
  const executionQueue = {};
  const activeThreads = {};

  const advanceSlackQueue = (threadTimestamp) => {
    if (activeThreads[threadTimestamp] || !executionQueue[threadTimestamp] || !executionQueue[threadTimestamp].length) return;
    activeThreads[threadTimestamp] = true;
    const task = executionQueue[threadTimestamp].shift();
    const rootExecution = mapping[threadTimestamp] || task.mappingEntry || { channel: task.channel, offset: 0, subagents: {} };
    rootExecution.channel = task.channel;
    if (typeof rootExecution.sessionId !== 'string' || !rootExecution.sessionId.trim()) {
      delete rootExecution.sessionId;
      rootExecution.pendingId = `slack_init_${crypto.randomUUID()}`;
      rootExecution.offset = 0;
    }
    mapping[threadTimestamp] = rootExecution;
    saveMapping(mapping, MAPPING_PATH);
    const publication = beginExecution(app.client, threadTimestamp, rootExecution.channel, rootExecution);
    logDebug('execution_started');
    const uniqueId = rootExecution.pendingId || '';
    const prompt = createRootPrompt(task.userText, uniqueId);
    const args = createAgyArguments(prompt, rootExecution.sessionId);
    if (rootExecution.sessionId) logDebug('conversation_resumed');
    const child = spawn('agy', [...args, '--output-format', 'stream-json'], { cwd: WORKSPACE_DIR, stdio: ['ignore', 'pipe', 'ignore'] });
    const streamParser = createStreamJsonParser((event) => {
      if (bindRootSessionFromInit(event, rootExecution)) {
        saveMapping(mapping, MAPPING_PATH);
        logDebug('root_session_bound');
      }
      const status = parseStreamSubagentEvent(event, publication);
      if (status) {
        publishStatus(app.client, threadTimestamp, rootExecution.channel, publication, status.text, status);
        rootExecution.subagents[status.conversationId] = { offset: 0, sessionId: status.conversationId };
      }
      for (const narrative of applyStreamAgentResponseEvent(event, publication)) {
        publishIntermediateNarrative(app.client, threadTimestamp, rootExecution.channel, publication, narrative);
      }
    });
    child.stdout.on('data', streamParser);
    const reconciliationTimer = setInterval(() => {
      reconcileRootTranscriptDuringExecution(rootExecution, threadTimestamp, app.client, mapping, logDebug, BRAIN_DIR, MAPPING_PATH);
    }, 250);
    const finish = () => {
      clearInterval(reconciliationTimer);
      streamParser.flush();
      clearAgentResponseBuffers(publication);
      applyRootTranscriptAtFinish(rootExecution, threadTimestamp, app.client, mapping, logDebug, BRAIN_DIR, MAPPING_PATH);
      publishConsolidation(app.client, threadTimestamp, rootExecution.channel, publication);
      if (publication.latestRootResponse) publication.latestRootResponse = createConsolidatedFinal(publication);
      publishFinalWithUploads(app.client, threadTimestamp, rootExecution.channel, publication);
      activeThreads[threadTimestamp] = false;
      logDebug('execution_finished');
      advanceSlackQueue(threadTimestamp);
    };
    child.once('close', finish);
    child.once('error', () => {
      logDebug('execution_process_failed');
      finish();
    });
  };

  const watcher = chokidar.watch(BRAIN_DIR, { ignored: (filePath) => !filePath.endsWith('transcript.jsonl'), ignoreInitial: true, persistent: true, depth: 4 });
  const reactToTranscriptChange = (filePath) => {
    const sessionId = filePath.split(path.sep).slice(-4)[0];
    for (const [threadTimestamp, rootExecution] of Object.entries(mapping)) {
      if (rootExecution.pendingId) {
        try {
          if (fs.readFileSync(filePath, 'utf8').includes(rootExecution.pendingId)) {
            rootExecution.sessionId = sessionId;
            rootExecution.offset = 0;
            delete rootExecution.pendingId;
          }
        } catch {}
      }
      if (rootExecution.sessionId === sessionId) applyNewLines(filePath, threadTimestamp, rootExecution, rootExecution, false, app.client, mapping, MAPPING_PATH);
      if (rootExecution.subagents && rootExecution.subagents[sessionId]) applyNewLines(filePath, threadTimestamp, rootExecution, rootExecution.subagents[sessionId], true, app.client, mapping, MAPPING_PATH);
    }
  };
  watcher.on('add', reactToTranscriptChange);
  watcher.on('change', reactToTranscriptChange);

  app.event('message', async ({ event, client }) => {
    if (event.bot_id || (event.subtype && event.subtype !== 'file_share')) return;
    logDebug('message_received');
    const threadTimestamp = event.thread_ts || event.ts;
    const channel = event.channel;
    const busyThread = Boolean(activeThreads[threadTimestamp]);
    const mappingEntry = busyThread ? null : mapping[threadTimestamp] || { channel, offset: 0, subagents: {} };
    if (mappingEntry) mappingEntry.channel = channel;
    const acknowledgementState = {};
    publishAcknowledgement(client, threadTimestamp, channel, acknowledgementState);
    if (!busyThread) {
      mapping[threadTimestamp] = mappingEntry;
      saveMapping(mapping, MAPPING_PATH);
    }
    const userText = (event.text || '').trim() || 'O usuário enviou um anexo para análise.';
    executionQueue[threadTimestamp] = executionQueue[threadTimestamp] || [];
    const task = { channel, userText, mappingEntry: mappingEntry, statusPublication: createPublicationState() }; // Ensure createPublicationState exists
    executionQueue[threadTimestamp].push(task);
    if (busyThread) publishQueuedStatus(client, threadTimestamp, channel, task);
    advanceSlackQueue(threadTimestamp);
  });
  app.start().then(() => {
    console.log('Slack Bridge is running.');
    logDebug('bridge_started');
  });
}

module.exports = { startBridge };

if (require.main === module) startBridge();
