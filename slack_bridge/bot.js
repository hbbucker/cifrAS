const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { App } = require('@slack/bolt');
const chokidar = require('chokidar');
const { default: PQueue } = require('p-queue');

require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const SLACK_MARKDOWN_LIMIT = 11_500;
const STATUS_INTERVAL_MS = 15_000;
const ROOT_RECONCILIATION_INTERVAL_MS = 250;
const INTERMEDIATE_NARRATIVE_LIMIT = 750;
const MAX_NARRATIVES_PER_ROLE = 3;
const ACKNOWLEDGEMENT_STATUS = 'CEO entendeu a solicitação e está avaliando o encaminhamento.';
const QUEUED_STATUS = 'CEO está concluindo o processamento anterior; esta solicitação está na fila.';
const CANONICAL_ROLES = new Set(['CPO', 'CTO', 'Frontend Staff', 'QA Lead']);
const AGY_SUBAGENT_TYPE_ROLES = Object.freeze({
  cpo_agent: 'CPO',
  cto_agent: 'CTO',
  frontend_agent: 'Frontend Staff',
  qa_agent: 'QA Lead',
});
const ROOT_PROMPT_REPORTING_CONTRACT = [
  'Para cada instrução delegada, produza dois relatos humanos úteis: (1) entendimento e abordagem antes de iniciar a etapa, e (2) resultado e pendências somente após receber resultado real.',
  'Não invente término, aprovação, validação, entrega ou participação de papel sem evidência estrutural e resultado desta execução.',
  'Não inclua ferramentas, comandos, parâmetros, output, erros, IDs, URIs, URLs, paths, telemetria, prompts, tokens, segredos ou transcript bruto nos relatos.',
].join(' ');
const DEBUG_EVENTS = new Set([
  'bridge_started',
  'message_received',
  'ack_queued',
  'ack_published',
  'ack_failed',
  'execution_started',
  'delegation_detected',
  'delegation_ambiguous',
  'association_confirmed',
  'association_ambiguous',
  'root_session_bound',
  'conversation_resumed',
  'root_session_unmapped',
  'root_session_reconciled',
  'root_transcript_missing',
  'subagent_activity',
  'subagent_completed',
  'subagent_blocked',
  'status_queued',
  'final_queued',
  'final_skipped_no_root_response',
  'final_published',
  'final_publication_failed',
  'file_upload_failed',
  'transcript_processing_failed',
  'execution_finished',
  'execution_process_failed',
]);
const ROLE_PROGRESS_MESSAGES = {
  CPO: {
    delegated: 'CEO acionou o CPO/UX para definir critérios e jornada.',
    started: 'CPO está definindo critérios de aceite e jornada.',
    completed: 'CPO concluiu a análise de produto.',
  },
  CTO: {
    delegated: 'CEO enviou ao CTO a avaliação de viabilidade técnica.',
    started: 'CTO está avaliando a viabilidade técnica.',
    completed: 'CTO concluiu a avaliação técnica.',
  },
  'Frontend Staff': {
    delegated: 'CEO acionou o Frontend Staff para implementar a experiência.',
    started: 'Frontend Staff está implementando a experiência.',
    completed: 'Frontend Staff concluiu a implementação da experiência.',
  },
  'QA Lead': {
    delegated: 'CEO acionou o QA Lead para definir a validação independente.',
    started: 'QA Lead está conduzindo a validação independente.',
    completed: 'QA Lead concluiu a validação independente.',
  },
};
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || (fs.existsSync(path.join(process.cwd(), 'AGENTS.md')) ? process.cwd() : path.resolve(__dirname, '..'));
const BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');
const MAPPING_PATH = path.join(__dirname, 'thread_mapping.json');
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const slackQueues = {};

function createDebugLogger(enabled = process.env.SLACK_BRIDGE_DEBUG === '1', write = (line) => process.stdout.write(`${line}\n`)) {
  return (eventName, role) => {
    if (!enabled || !DEBUG_EVENTS.has(eventName)) return;
    const event = { event: eventName };
    if (CANONICAL_ROLES.has(role)) event.role = role;
    write(`[Slack Bridge debug] ${JSON.stringify(event)}`);
  };
}

const logDebug = createDebugLogger();

function createPublicationState() {
  return {
    finalPublished: false,
    latestRootResponse: '',
    pendingDelegation: null,
    plannedRoles: [],
    roleByConversation: {},
    startedRoles: [],
    completedRoles: [],
    blockedRoles: [],
    participantRoles: [],
    lastStatus: '',
    lastStatusAt: 0,
    agentResponseBuffers: {},
    agentResponseOrder: [],
    nextAgentResponseIndex: 0,
    publishedNarratives: [],
    narrativeCountByRole: {},
    completedAgentResponseKeys: [],
  };
}

function createAccessibleFallback(markdown) {
  return redactLocalPaths(markdown)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/```[\w-]*\n?/g, '')
    .replace(/```/g, '')
    .trim();
}

function redactLocalPaths(text) {
  return String(text || '')
    .replace(/file:\/\/\/[^\s)\]}]+/gi, '[arquivo local removido]')
    .replace(/(?:^|[\s(])(?:\/[A-Za-z0-9._-]+){2,}/g, (match) => `${match[0]}[caminho local removido]`);
}

function extractLocalFiles(markdown) {
  const filePaths = [];
  const markdownWithoutLocalFiles = String(markdown || '').replace(/!?\[([^\]]*)\]\((file:\/\/\/[^)]+|\/(?:[^)\s]+))\)/g, (match, label, location) => {
    const filePath = location.startsWith('file:///') ? decodeURIComponent(location.slice('file://'.length)) : location;
    if (path.isAbsolute(filePath)) filePaths.push(filePath);
    return '';
  });
  return { filePaths: [...new Set(filePaths)], markdown: redactLocalPaths(markdownWithoutLocalFiles).trim() };
}

function splitMarkdownForSlack(markdown) {
  const blocks = String(markdown || '').trim().split(/\n{2,}/).filter(Boolean);
  const chunks = [];
  let currentChunk = '';

  for (const block of blocks) {
    if (block.length > SLACK_MARKDOWN_LIMIT && /^```/.test(block)) {
      throw new Error('code block exceeds Slack Markdown limit');
    }
    if (block.length > SLACK_MARKDOWN_LIMIT) {
      const words = block.split(/(\s+)/);
      let fragment = '';
      for (const word of words) {
        if (fragment.length + word.length > SLACK_MARKDOWN_LIMIT) {
          if (!fragment.trim()) throw new Error('Markdown token exceeds Slack Markdown limit');
          chunks.push(fragment.trim());
          fragment = word.trimStart();
        } else {
          fragment += word;
        }
      }
      if (fragment.trim()) chunks.push(fragment.trim());
      continue;
    }
    const candidate = currentChunk ? `${currentChunk}\n\n${block}` : block;
    if (candidate.length <= SLACK_MARKDOWN_LIMIT) {
      currentChunk = candidate;
    } else {
      chunks.push(currentChunk);
      currentChunk = block;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

function getSlackQueue(threadTimestamp) {
  if (!slackQueues[threadTimestamp]) slackQueues[threadTimestamp] = new PQueue({ concurrency: 1 });
  return slackQueues[threadTimestamp];
}

function waitForSlackQueue(threadTimestamp) {
  return getSlackQueue(threadTimestamp).onIdle();
}

async function postFinalMessage(client, channel, threadTimestamp, markdown) {
  const fallback = createAccessibleFallback(markdown) || 'A resposta foi concluída.';
  const nativePayload = {
    channel,
    thread_ts: threadTimestamp,
    text: fallback,
    blocks: [{ type: 'markdown', text: markdown }],
  };
  try {
    await client.chat.postMessage(nativePayload);
  } catch (error) {
    const slackError = error && error.data && error.data.error;
    if (slackError !== 'invalid_blocks' && slackError !== 'invalid_arguments') throw error;
    await client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: fallback });
  }
}

function publishStatus(client, threadTimestamp, channel, publication, status, options = {}) {
  const statusOptions = options === true ? { bypassInterval: true } : options;
  const cleanStatus = redactLocalPaths(status).replace(/[\n*_`#]/g, ' ').replace(/\s+/g, ' ').trim();
  const now = Date.now();
  if (!cleanStatus || cleanStatus === publication.lastStatus) return false;
  if (!statusOptions.bypassInterval && !statusOptions.blocking && now - publication.lastStatusAt < STATUS_INTERVAL_MS) return false;
  publication.lastStatus = cleanStatus;
  publication.lastStatusAt = now;
  getSlackQueue(threadTimestamp).add(() => client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: cleanStatus }));
  logDebug('status_queued');
  return true;
}

function publishQueuedStatus(client, threadTimestamp, channel, task) {
  const publication = task.statusPublication || (task.mappingEntry && task.mappingEntry.publication);
  return publication ? publishStatus(client, threadTimestamp, channel, publication, QUEUED_STATUS, { bypassInterval: true }) : false;
}

function publishAcknowledgement(client, threadTimestamp, channel, mappingEntry) {
  if (mappingEntry.acknowledgementPublished) return false;
  mappingEntry.acknowledgementPublished = true;
  logDebug('ack_queued');
  getSlackQueue(threadTimestamp).add(async () => {
    try {
      await client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: ACKNOWLEDGEMENT_STATUS });
      logDebug('ack_published');
    } catch (error) {
      logDebug('ack_failed');
    }
  });
  return true;
}

function publishFinalWithUploads(client, threadTimestamp, channel, publication) {
  if (publication.finalPublished) return false;
  if (!publication.latestRootResponse) {
    logDebug('final_skipped_no_root_response');
    return false;
  }
  publication.finalPublished = true;
  const extracted = extractLocalFiles(publication.latestRootResponse);
  logDebug('final_queued');
  getSlackQueue(threadTimestamp).add(async () => {
    try {
      for (const markdown of splitMarkdownForSlack(extracted.markdown)) {
        await postFinalMessage(client, channel, threadTimestamp, markdown);
      }
    } catch (error) {
      logDebug('final_publication_failed');
      await client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: 'Não consegui publicar a resposta agora. Tente novamente em instantes.' });
      return;
    }
    logDebug('final_published');
    for (const filePath of extracted.filePaths) {
      if (!fs.existsSync(filePath)) continue;
      try {
        await client.files.uploadV2({
          channel_id: channel,
          thread_ts: threadTimestamp,
          file: fs.createReadStream(filePath),
          filename: path.basename(filePath),
        });
      } catch (error) {
        logDebug('file_upload_failed');
        await client.chat.postMessage({ channel, thread_ts: threadTimestamp, text: 'Não consegui publicar a resposta agora. Tente novamente em instantes.' });
      }
    }
  });
  return true;
}

function parseDelegatedRole(toolCall) {
  if (!toolCall || toolCall.name !== 'invoke_subagent' || !toolCall.args || !toolCall.args.Subagents) return null;
  let subagents = toolCall.args.Subagents;
  try {
    if (typeof subagents === 'string') subagents = JSON.parse(subagents);
  } catch {
    return null;
  }
  if (!Array.isArray(subagents) || subagents.length !== 1) return null;
  const role = subagents[0].Role || subagents[0].TypeName;
  return CANONICAL_ROLES.has(role) ? role : null;
}

function getRoleProgressMessage(role, stage) {
  return ROLE_PROGRESS_MESSAGES[role] && ROLE_PROGRESS_MESSAGES[role][stage] ? ROLE_PROGRESS_MESSAGES[role][stage] : null;
}

function extractConversationIds(eventContent) {
  const matches = String(eventContent || '').matchAll(/"conversationId"\s*:\s*"([^"]+)"/g);
  return [...new Set([...matches].map((match) => match[1]))];
}

function parseStreamSubagentEvent(event, publication) {
  const subagents = event && event.event === 'step_update' && event.step_update && event.step_update.subagent_info && event.step_update.subagent_info.subagents;
  if (!Array.isArray(subagents) || subagents.length !== 1) return null;
  const subagent = subagents[0];
  const role = AGY_SUBAGENT_TYPE_ROLES[subagent.type_name];
  if (!role || typeof subagent.conversation_id !== 'string' || !subagent.conversation_id || typeof subagent.log_uri !== 'string') return null;
  let logPath;
  try { logPath = path.resolve(new URL(subagent.log_uri).pathname); } catch { return null; }
  if (!logPath.startsWith(`${BRAIN_DIR}${path.sep}`) || publication.roleByConversation[subagent.conversation_id]) return null;
  publication.roleByConversation[subagent.conversation_id] = role;
  if (publication.plannedRoles.includes(role)) return null;
  publication.plannedRoles.push(role);
  return { text: getRoleProgressMessage(role, 'delegated'), bypassInterval: true, conversationId: subagent.conversation_id };
}

function createStreamJsonParser(onEvent) {
  let pending = '';
  const parseLine = (line) => {
    try { onEvent(JSON.parse(line)); } catch {}
  };
  const parser = (chunk) => {
    pending += String(chunk || '');
    const lines = pending.split('\n');
    pending = lines.pop();
    for (const line of lines) parseLine(line);
  };
  parser.flush = () => {
    if (pending.trim()) parseLine(pending);
    pending = '';
  };
  return parser;
}

function extractRootConversationId(event) {
  if (!event || event.event !== 'init' || typeof event.conversation_id !== 'string') return null;
  const conversationId = event.conversation_id.trim();
  return conversationId || null;
}

function bindRootSessionFromInit(event, rootData) {
  const conversationId = extractRootConversationId(event);
  if (!conversationId || !rootData || rootData.sessionId === conversationId) return false;
  rootData.sessionId = conversationId;
  rootData.offset = 0;
  delete rootData.pendingId;
  return true;
}

function createRootPrompt(userText, pendingId) {
  const marker = pendingId ? `\n[IGNORE_THIS_INTERNAL_ID: ${pendingId}]` : '';
  return `Você é o Founder & CEO AI. Consulte AGENTS.md e use a skill startupos-ceo para coordenar os papéis. ${ROOT_PROMPT_REPORTING_CONTRACT} Mensagem do usuário: ${userText}${marker}`;
}

function createAgyArguments(prompt, sessionId) {
  const args = ['-p', prompt, '--add-dir', WORKSPACE_DIR];
  if (typeof sessionId === 'string' && sessionId.trim()) args.push('--conversation', sessionId.trim());
  return [...args, '--print-timeout', '1h', '--dangerously-skip-permissions'];
}

function sanitizeIntermediateNarrative(text) {
  const narrative = String(text || '').trim();
  if (!narrative || narrative.length > INTERMEDIATE_NARRATIVE_LIMIT) return null;
  const unsafePattern = /(?:\b(?:tool|tool_info|parameters?|output|error|prompt|token|secret|password|api[_ -]?key|authorization|bearer)\b|xox[baprs]-|sk-[A-Za-z0-9_-]+|AIza[\w-]+|(?:https?|file|vscode|data):\/\/|(?:^|\s)(?:\/|~\/|\.\.?\/)|[A-Za-z]:\\|\b(?:conversation|session|thread|step)[_-]?id\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\b[A-Za-z0-9_-]{24,}\b|```|(?:^|\n)\s*(?:npm|node|git|curl|wget|rm|cp|mv)\b|\b(?:conclu[ií]|finaliz|aprovad|entreg(?:uei|ue|a)|pronta para integra[cç][aã]o)\w*)/i;
  if (unsafePattern.test(narrative)) return null;
  return narrative;
}

function appendAgentResponseDelta(stepUpdate, publication) {
  if (!stepUpdate || stepUpdate.step_type !== 'agent_response') return [];
  const conversationId = stepUpdate.conversation_id;
  const stepId = stepUpdate.step_id;
  const role = typeof conversationId === 'string' && publication.roleByConversation[conversationId];
  if (!role || typeof stepId !== 'string' || !stepId || !['ACTIVE', 'DONE'].includes(stepUpdate.status)) return [];
  const bufferKey = `${conversationId}:${stepId}`;
  if (publication.completedAgentResponseKeys.includes(bufferKey)) return [];
  let buffer = publication.agentResponseBuffers[bufferKey];
  if (!buffer) {
    buffer = { key: bufferKey, role, text: '', done: false };
    publication.agentResponseBuffers[bufferKey] = buffer;
    publication.agentResponseOrder.push(bufferKey);
  }
  if (typeof stepUpdate.text_delta === 'string') buffer.text += stepUpdate.text_delta;
  if (stepUpdate.status !== 'DONE' || buffer.done) return [];
  buffer.done = true;
  publication.completedAgentResponseKeys.push(bufferKey);

  const narratives = [];
  while (publication.nextAgentResponseIndex < publication.agentResponseOrder.length) {
    const nextKey = publication.agentResponseOrder[publication.nextAgentResponseIndex];
    const nextBuffer = publication.agentResponseBuffers[nextKey];
    if (!nextBuffer || !nextBuffer.done) break;
    publication.nextAgentResponseIndex += 1;
    const narrative = sanitizeIntermediateNarrative(nextBuffer.text);
    const narrativeKey = narrative && `${nextBuffer.role}:${narrative}`;
    if (narrative && !publication.publishedNarratives.includes(narrativeKey) && (publication.narrativeCountByRole[nextBuffer.role] || 0) < MAX_NARRATIVES_PER_ROLE) {
      publication.publishedNarratives.push(narrativeKey);
      publication.narrativeCountByRole[nextBuffer.role] = (publication.narrativeCountByRole[nextBuffer.role] || 0) + 1;
      if (!publication.participantRoles.includes(nextBuffer.role)) publication.participantRoles.push(nextBuffer.role);
      narratives.push({ role: nextBuffer.role, markdown: `**${nextBuffer.role} — atualização durante o processamento**\n\n${narrative}` });
    }
    delete publication.agentResponseBuffers[nextKey];
  }
  return narratives;
}

function processStreamAgentResponseEvent(event, publication) {
  if (!event || event.event !== 'step_update' || publication.finalPublished) return [];
  return appendAgentResponseDelta(event.step_update, publication);
}

function publishIntermediateNarrative(client, threadTimestamp, channel, publication, narrative) {
  if (publication.finalPublished || !narrative || !narrative.markdown) return false;
  getSlackQueue(threadTimestamp).add(async () => {
    await postFinalMessage(client, channel, threadTimestamp, narrative.markdown);
  });
  return true;
}

function processRootTranscriptEvent(event, publication) {
  let status = null;
  if (event.type === 'PLANNER_RESPONSE' && Array.isArray(event.tool_calls)) {
    const delegationCalls = event.tool_calls.filter((toolCall) => toolCall.name === 'invoke_subagent');
    if (delegationCalls.length) {
      const delegatedRoles = delegationCalls.map(parseDelegatedRole).filter(Boolean);
      publication.pendingDelegation = delegatedRoles.length === 1 && delegationCalls.length === 1 ? delegatedRoles[0] : null;
      if (publication.pendingDelegation && !publication.plannedRoles.includes(publication.pendingDelegation)) {
        publication.plannedRoles.push(publication.pendingDelegation);
        logDebug('delegation_detected', publication.pendingDelegation);
        status = { text: getRoleProgressMessage(publication.pendingDelegation, 'delegated'), bypassInterval: true };
      } else if (!publication.pendingDelegation) {
        logDebug('delegation_ambiguous');
      }
    }
  }
  if (event.type === 'INVOKE_SUBAGENT') {
    const conversationIds = extractConversationIds(event.content);
    if (publication.pendingDelegation && conversationIds.length === 1 && !publication.roleByConversation[conversationIds[0]]) {
      publication.roleByConversation[conversationIds[0]] = publication.pendingDelegation;
      logDebug('association_confirmed', publication.pendingDelegation);
    } else if (conversationIds.length) {
      logDebug('association_ambiguous');
    }
    publication.pendingDelegation = null;
  }
  if (event.source === 'MODEL' && event.type === 'PLANNER_RESPONSE' && event.content) {
    const content = String(event.content).trim();
    if (content && !content.includes('IGNORE_THIS_INTERNAL_ID')) publication.latestRootResponse = content;
  }
  return status;
}

function processSubagentTranscriptEvent(event, publication, sessionId) {
  const role = publication.roleByConversation[sessionId];
  if (!role) return null;
  const lifecycle = getConfirmedSubagentLifecycle(event, sessionId);
  if (lifecycle === 'BLOCKED' && !publication.blockedRoles.includes(role)) {
    publication.blockedRoles.push(role);
    if (!publication.participantRoles.includes(role)) publication.participantRoles.push(role);
    logDebug('subagent_blocked', role);
    return { text: `${role} sinalizou um bloqueio que precisa de decisão.`, blocking: true };
  }
  if (lifecycle === 'COMPLETED' && !publication.completedRoles.includes(role)) {
    publication.completedRoles.push(role);
    if (!publication.participantRoles.includes(role)) publication.participantRoles.push(role);
    logDebug('subagent_completed', role);
    return { text: getRoleProgressMessage(role, 'completed'), bypassInterval: true };
  }
  if (event.source === 'MODEL' && event.type === 'PLANNER_RESPONSE' && !publication.startedRoles.includes(role)) {
    publication.startedRoles.push(role);
    if (!publication.participantRoles.includes(role)) publication.participantRoles.push(role);
    logDebug('subagent_activity', role);
    return { text: getRoleProgressMessage(role, 'started'), bypassInterval: true };
  }
  return null;
}

function getConfirmedSubagentLifecycle(event, sessionId) {
  if (!event || event.type !== 'SUBAGENT_LIFECYCLE' || !event.metadata || event.metadata.conversationId !== sessionId) return null;
  return event.metadata.status === 'COMPLETED' || event.metadata.status === 'BLOCKED' ? event.metadata.status : null;
}

function beginExecution(client, threadTimestamp, channel, mappingEntry) {
  const publication = createPublicationState();
  mappingEntry.publication = publication;
  mappingEntry.subagents = {};
  publishStatus(client, threadTimestamp, channel, publication, 'CEO está coordenando a solicitação.', { bypassInterval: true });
  return publication;
}

function publishConsolidation(client, threadTimestamp, channel, publication) {
  const participants = publication.participantRoles;
  const participantText = participants.length ? ` com contribuição de ${participants.join(' e ')}` : '';
  publishStatus(client, threadTimestamp, channel, publication, `CEO está consolidando a entrega${participantText}.`, { bypassInterval: true });
}

function createConsolidatedFinal(publication) {
  const participantText = publication.participantRoles.length
    ? ` com participação confirmada de ${publication.participantRoles.join(' e ')}`
    : ' — nenhuma participação especialista confirmada nesta execução';
  return `**CEO — consolidação${participantText}**\n\n${publication.latestRootResponse}`;
}

function serializeMapping(mapping) {
  const transientPublicationKeys = new Set([
    'agentResponseBuffers',
    'agentResponseOrder',
    'nextAgentResponseIndex',
    'publishedNarratives',
    'narrativeCountByRole',
    'completedAgentResponseKeys',
  ]);
  return JSON.stringify(mapping, (key, value) => (transientPublicationKeys.has(key) ? undefined : value), 2);
}

function saveMapping(mapping) {
  fs.writeFileSync(MAPPING_PATH, serializeMapping(mapping));
}

function clearAgentResponseBuffers(publication) {
  publication.agentResponseBuffers = {};
  publication.agentResponseOrder = [];
  publication.nextAgentResponseIndex = 0;
  publication.completedAgentResponseKeys = [];
}

function readTranscriptLines(filePath, state) {
  const stats = fs.statSync(filePath);
  if (stats.size <= (state.offset || 0)) return [];
  const length = stats.size - (state.offset || 0);
  const buffer = Buffer.alloc(length);
  const descriptor = fs.openSync(filePath, 'r');
  fs.readSync(descriptor, buffer, 0, length, state.offset || 0);
  fs.closeSync(descriptor);
  const data = buffer.toString('utf8');
  const newlineIndex = data.lastIndexOf('\n');
  if (newlineIndex === -1) return [];
  const completeData = data.slice(0, newlineIndex + 1);
  state.offset = (state.offset || 0) + Buffer.byteLength(completeData, 'utf8');
  return completeData.split('\n').filter(Boolean).flatMap((line) => {
    try { return [JSON.parse(line)]; } catch { return []; }
  });
}

function processNewLines(filePath, threadTimestamp, rootData, stateData, isSubagent, client, mapping) {
  try {
    const events = readTranscriptLines(filePath, stateData);
    const publication = rootData.publication;
    if (!publication) return;
    for (const event of events) {
      if (isSubagent) {
        const status = processSubagentTranscriptEvent(event, publication, stateData.sessionId);
        if (status) publishStatus(client, threadTimestamp, rootData.channel, publication, status.text, status);
      } else {
        const status = processRootTranscriptEvent(event, publication);
        if (status) publishStatus(client, threadTimestamp, rootData.channel, publication, status.text, status);
        if (event.type === 'INVOKE_SUBAGENT') {
          for (const conversationId of extractConversationIds(event.content)) {
            if (!publication.roleByConversation[conversationId]) continue;
            rootData.subagents[conversationId] = { offset: 0, sessionId: conversationId };
            const subagentPath = path.join(BRAIN_DIR, conversationId, '.system_generated', 'logs', 'transcript.jsonl');
            if (fs.existsSync(subagentPath)) processNewLines(subagentPath, threadTimestamp, rootData, rootData.subagents[conversationId], true, client, mapping);
          }
        }
      }
    }
    saveMapping(mapping);
  } catch (error) {
    console.error('Slack Bridge transcript processing failed.');
    logDebug('transcript_processing_failed');
  }
}

function reconcileRootSession(rootData, brainDir = BRAIN_DIR) {
  if (rootData.sessionId || !rootData.pendingId || !fs.existsSync(brainDir)) return null;
  const matchingTranscripts = [];
  for (const entry of fs.readdirSync(brainDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const transcriptPath = path.join(brainDir, entry.name, '.system_generated', 'logs', 'transcript.jsonl');
    try {
      if (fs.existsSync(transcriptPath) && fs.readFileSync(transcriptPath, 'utf8').includes(rootData.pendingId)) {
        matchingTranscripts.push({ sessionId: entry.name, transcriptPath });
      }
    } catch {}
  }
  if (matchingTranscripts.length !== 1) return null;
  rootData.sessionId = matchingTranscripts[0].sessionId;
  rootData.offset = 0;
  delete rootData.pendingId;
  return matchingTranscripts[0].transcriptPath;
}

function processRootTranscriptAtFinish(rootData, threadTimestamp, client, mapping, debugLogger = logDebug, brainDir = BRAIN_DIR) {
  if (!rootData.sessionId) {
    const reconciledPath = reconcileRootSession(rootData, brainDir);
    if (!reconciledPath) {
      debugLogger('root_session_unmapped');
      return false;
    }
    debugLogger('root_session_reconciled');
    processNewLines(reconciledPath, threadTimestamp, rootData, rootData, false, client, mapping);
    return true;
  }
  const rootPath = path.join(BRAIN_DIR, rootData.sessionId, '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(rootPath)) {
    debugLogger('root_transcript_missing');
    return false;
  }
  processNewLines(rootPath, threadTimestamp, rootData, rootData, false, client, mapping);
  return true;
}

function reconcileRootTranscriptDuringExecution(rootData, threadTimestamp, client, mapping, debugLogger = logDebug, brainDir = BRAIN_DIR) {
  if (rootData.sessionId) return false;
  const reconciledPath = reconcileRootSession(rootData, brainDir);
  if (!reconciledPath) return false;
  debugLogger('root_session_reconciled');
  processNewLines(reconciledPath, threadTimestamp, rootData, rootData, false, client, mapping);
  return true;
}

async function downloadSlackFile(fileUrl, targetPath, botToken) {
  const response = await fetch(fileUrl, { headers: { Authorization: `Bearer ${botToken}` } });
  if (!response.ok) throw new Error(`Slack download failed with status ${response.status}`);
  fs.writeFileSync(targetPath, Buffer.from(await response.arrayBuffer()));
  return targetPath;
}

function startBridge() {
  if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  const app = new App({ token: process.env.SLACK_BOT_TOKEN, appToken: process.env.SLACK_APP_TOKEN, socketMode: true });
  let mapping = {};
  if (fs.existsSync(MAPPING_PATH)) {
    try { mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8')); } catch { mapping = {}; }
  }
  const executionQueue = {};
  const activeThreads = {};

  const processQueue = (threadTimestamp) => {
    if (activeThreads[threadTimestamp] || !executionQueue[threadTimestamp] || !executionQueue[threadTimestamp].length) return;
    activeThreads[threadTimestamp] = true;
    const task = executionQueue[threadTimestamp].shift();
    const rootData = mapping[threadTimestamp] || task.mappingEntry || { channel: task.channel, offset: 0, subagents: {} };
    rootData.channel = task.channel;
    if (typeof rootData.sessionId !== 'string' || !rootData.sessionId.trim()) {
      delete rootData.sessionId;
      rootData.pendingId = `slack_init_${crypto.randomUUID()}`;
      rootData.offset = 0;
    }
    mapping[threadTimestamp] = rootData;
    saveMapping(mapping);
    const publication = beginExecution(app.client, threadTimestamp, rootData.channel, rootData);
    logDebug('execution_started');
    const uniqueId = rootData.pendingId || '';
    const prompt = createRootPrompt(task.userText, uniqueId);
    const args = createAgyArguments(prompt, rootData.sessionId);
    if (rootData.sessionId) logDebug('conversation_resumed');
    const child = spawn('agy', [...args, '--output-format', 'stream-json'], { cwd: WORKSPACE_DIR, stdio: ['ignore', 'pipe', 'ignore'] });
    const streamParser = createStreamJsonParser((event) => {
      if (bindRootSessionFromInit(event, rootData)) {
        saveMapping(mapping);
        logDebug('root_session_bound');
      }
      const status = parseStreamSubagentEvent(event, publication);
      if (status) {
        publishStatus(app.client, threadTimestamp, rootData.channel, publication, status.text, status);
        rootData.subagents[status.conversationId] = { offset: 0, sessionId: status.conversationId };
      }
      for (const narrative of processStreamAgentResponseEvent(event, publication)) {
        publishIntermediateNarrative(app.client, threadTimestamp, rootData.channel, publication, narrative);
      }
    });
    child.stdout.on('data', streamParser);
    const reconciliationTimer = setInterval(() => {
      reconcileRootTranscriptDuringExecution(rootData, threadTimestamp, app.client, mapping);
    }, ROOT_RECONCILIATION_INTERVAL_MS);
    const finish = () => {
      clearInterval(reconciliationTimer);
      streamParser.flush();
      clearAgentResponseBuffers(publication);
      processRootTranscriptAtFinish(rootData, threadTimestamp, app.client, mapping);
      publishConsolidation(app.client, threadTimestamp, rootData.channel, publication);
      if (publication.latestRootResponse) publication.latestRootResponse = createConsolidatedFinal(publication);
      publishFinalWithUploads(app.client, threadTimestamp, rootData.channel, publication);
      activeThreads[threadTimestamp] = false;
      logDebug('execution_finished');
      processQueue(threadTimestamp);
    };
    child.once('close', finish);
    child.once('error', () => {
      logDebug('execution_process_failed');
      finish();
    });
  };

  const watcher = chokidar.watch(BRAIN_DIR, { ignored: (filePath) => !filePath.endsWith('transcript.jsonl'), ignoreInitial: true, persistent: true, depth: 4 });
  const handleTranscript = (filePath) => {
    const sessionId = filePath.split(path.sep).slice(-4)[0];
    for (const [threadTimestamp, rootData] of Object.entries(mapping)) {
      if (rootData.pendingId) {
        try {
          if (fs.readFileSync(filePath, 'utf8').includes(rootData.pendingId)) {
            rootData.sessionId = sessionId;
            rootData.offset = 0;
            delete rootData.pendingId;
          }
        } catch {}
      }
      if (rootData.sessionId === sessionId) processNewLines(filePath, threadTimestamp, rootData, rootData, false, app.client, mapping);
      if (rootData.subagents && rootData.subagents[sessionId]) processNewLines(filePath, threadTimestamp, rootData, rootData.subagents[sessionId], true, app.client, mapping);
    }
  };
  watcher.on('add', handleTranscript);
  watcher.on('change', handleTranscript);

  app.event('message', async ({ event, client }) => {
    if (event.bot_id || (event.subtype && event.subtype !== 'file_share')) return;
    logDebug('message_received');
    const threadTimestamp = event.thread_ts || event.ts;
    const channel = event.channel;
    const busyThread = Boolean(activeThreads[threadTimestamp]);
    const entry = busyThread ? null : mapping[threadTimestamp] || { channel, offset: 0, subagents: {} };
    if (entry) entry.channel = channel;
    const acknowledgementState = {};
    publishAcknowledgement(client, threadTimestamp, channel, acknowledgementState);
    if (!busyThread) {
      mapping[threadTimestamp] = entry;
      saveMapping(mapping);
    }
    const userText = (event.text || '').trim() || 'O usuário enviou um anexo para análise.';
    executionQueue[threadTimestamp] = executionQueue[threadTimestamp] || [];
    const task = { channel, userText, mappingEntry: entry, statusPublication: createPublicationState() };
    executionQueue[threadTimestamp].push(task);
    if (busyThread) publishQueuedStatus(client, threadTimestamp, channel, task);
    processQueue(threadTimestamp);
  });
  app.start().then(() => {
    console.log('Slack Bridge is running.');
    logDebug('bridge_started');
  });
}

module.exports = {
  CANONICAL_ROLES,
  ACKNOWLEDGEMENT_STATUS,
  AGY_SUBAGENT_TYPE_ROLES,
  ROOT_PROMPT_REPORTING_CONTRACT,
  DEBUG_EVENTS,
  ROLE_PROGRESS_MESSAGES,
  QUEUED_STATUS,
  SLACK_MARKDOWN_LIMIT,
  createAccessibleFallback,
  createAgyArguments,
  createRootPrompt,
  beginExecution,
  createConsolidatedFinal,
  createDebugLogger,
  createPublicationState,
  extractConversationIds,
  extractLocalFiles,
  getConfirmedSubagentLifecycle,
  getRoleProgressMessage,
  parseDelegatedRole,
  parseStreamSubagentEvent,
  postFinalMessage,
  createStreamJsonParser,
  clearAgentResponseBuffers,
  bindRootSessionFromInit,
  extractRootConversationId,
  processStreamAgentResponseEvent,
  publishIntermediateNarrative,
  processRootTranscriptEvent,
  processRootTranscriptAtFinish,
  reconcileRootTranscriptDuringExecution,
  reconcileRootSession,
  processSubagentTranscriptEvent,
  publishFinalWithUploads,
  publishAcknowledgement,
  publishQueuedStatus,
  publishQueuedStatus,
  publishConsolidation,
  publishStatus,
  redactLocalPaths,
  sanitizeIntermediateNarrative,
  serializeMapping,
  splitMarkdownForSlack,
  waitForSlackQueue,
};

if (require.main === module) startBridge();
