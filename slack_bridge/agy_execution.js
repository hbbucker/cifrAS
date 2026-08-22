const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { CANONICAL_ROLES, AGY_SUBAGENT_TYPE_ROLES, parseDelegatedRole, getRoleProgressMessage, extractConversationIds, getConfirmedSubagentLifecycle } = require('./role_attribution');
const { sanitizeIntermediateNarrative, createConsolidatedFinal, getRoleIcon } = require('./message_rendering');
const { publishStatus } = require('./slack_delivery');

const ROOT_RECONCILIATION_INTERVAL_MS = 250;
const MAX_NARRATIVES_PER_ROLE = 3;
const ROOT_PROMPT_REPORTING_CONTRACT = [
  'Produza relatos humanos úteis, claros e diretos sobre o seu entendimento, abordagem e resultados.',
  'Não invente término, aprovação, validação, entrega ou participação de papel sem evidência estrutural e resultado desta execução.',
  'Não inclua ferramentas, comandos, parâmetros, output, erros, IDs, URIs, URLs, paths, telemetria, prompts, tokens, segredos ou transcript bruto nos relatos.',
  'Responda sempre no mesmo idioma em que a instrução foi pedida.',
].join(' ');
const DEBUG_EVENTS = new Set([
  'bridge_started', 'message_received', 'ack_queued', 'ack_published', 'ack_failed', 'execution_started', 'delegation_detected', 'delegation_ambiguous', 'association_confirmed', 'association_ambiguous', 'root_session_bound', 'conversation_resumed', 'root_session_unmapped', 'root_session_reconciled', 'root_transcript_missing', 'subagent_activity', 'subagent_completed', 'subagent_blocked', 'status_queued', 'final_queued', 'final_skipped_no_root_response', 'final_published', 'final_publication_failed', 'file_upload_failed', 'transcript_processing_failed', 'execution_finished', 'execution_process_failed',
]);

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || (fs.existsSync(path.join(process.cwd(), 'AGENTS.md')) ? process.cwd() : path.resolve(__dirname, '..'));
const BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');

function createDebugLogger(enabled = process.env.SLACK_BRIDGE_DEBUG === '1', write = (line) => process.stdout.write(`${line}\n`)) {
  return (eventName, role) => {
    if (!enabled || !DEBUG_EVENTS.has(eventName)) return;
    const event = { event: eventName };
    if (CANONICAL_ROLES.has(role)) event.role = role;
    write(`[Slack Bridge debug] ${JSON.stringify(event)}`);
  };
}

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

function bindRootSessionFromInit(event, rootExecution) {
  const conversationId = extractRootConversationId(event);
  if (!conversationId || !rootExecution || rootExecution.sessionId === conversationId) return false;
  rootExecution.sessionId = conversationId;
  rootExecution.offset = 0;
  if (rootExecution.publication) rootExecution.publication.roleByConversation[conversationId] = 'CEO';
  delete rootExecution.pendingId;
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

function appendAgentResponseDelta(stepUpdate, publication) {
  if (!stepUpdate || stepUpdate.step_type !== 'agent_response') return [];
  const conversationId = stepUpdate.conversation_id;
  const stepId = stepUpdate.step_index; 
  const role = typeof conversationId === 'string' && publication.roleByConversation[conversationId];
  const state = stepUpdate.state || stepUpdate.status;
  if (!role || typeof stepId !== 'number' || !['ACTIVE', 'DONE'].includes(state)) return [];
  const bufferKey = `${conversationId}:${stepId}`;
  if (publication.completedAgentResponseKeys.includes(bufferKey)) return [];
  let buffer = publication.agentResponseBuffers[bufferKey];
  if (!buffer) {
    buffer = { key: bufferKey, role, text: '', done: false };
    publication.agentResponseBuffers[bufferKey] = buffer;
    publication.agentResponseOrder.push(bufferKey);
  }
  if (typeof stepUpdate.text_delta === 'string') buffer.text += stepUpdate.text_delta;
  if (state !== 'DONE' || buffer.done) return [];
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
      narratives.push({ role: nextBuffer.role, markdown: `**${getRoleIcon(nextBuffer.role)} — atualização durante o processamento**\n\n${narrative}` });
    }
    delete publication.agentResponseBuffers[nextKey];
  }
  return narratives;
}

function applyStreamAgentResponseEvent(event, publication) {
  if (!event || event.event !== 'step_update' || publication.finalPublished) return [];
  return appendAgentResponseDelta(event.step_update, publication);
}

function applyRootTranscriptEvent(event, publication) {
  let status = null;
  if (event.type === 'PLANNER_RESPONSE' && Array.isArray(event.tool_calls)) {
    const delegationCalls = event.tool_calls.filter((toolCall) => toolCall.name === 'invoke_subagent');
    if (delegationCalls.length) {
      const delegatedRoles = delegationCalls.map(parseDelegatedRole).filter(Boolean);
      publication.pendingDelegation = delegatedRoles.length === 1 && delegationCalls.length === 1 ? delegatedRoles[0] : null;
      if (publication.pendingDelegation && !publication.plannedRoles.includes(publication.pendingDelegation)) {
        publication.plannedRoles.push(publication.pendingDelegation);
        if (global.logDebug) global.logDebug('delegation_detected', publication.pendingDelegation);
        status = { text: getRoleProgressMessage(publication.pendingDelegation, 'delegated'), bypassInterval: true };
      } else if (!publication.pendingDelegation) {
        if (global.logDebug) global.logDebug('delegation_ambiguous');
      }
    }
  }
  if (event.type === 'GENERIC' && String(event.content || '').includes('Created the following subagents:')) {
    const conversationIds = extractConversationIds(event.content);
    if (publication.pendingDelegation && conversationIds.length === 1 && !publication.roleByConversation[conversationIds[0]]) {
      publication.roleByConversation[conversationIds[0]] = publication.pendingDelegation;
      if (global.logDebug) global.logDebug('association_confirmed', publication.pendingDelegation);
    } else if (conversationIds.length) {
      if (global.logDebug) global.logDebug('association_ambiguous');
    }
    publication.pendingDelegation = null;
  }
  if (event.source === 'MODEL' && event.type === 'PLANNER_RESPONSE' && event.content) {
    const content = String(event.content).trim();
    if (content && !content.includes('IGNORE_THIS_INTERNAL_ID')) publication.latestRootResponse = content;
  }
  return status;
}

function applySubagentTranscriptEvent(event, publication, sessionId) {
  const role = publication.roleByConversation[sessionId];
  if (!role) return null;
  const lifecycle = getConfirmedSubagentLifecycle(event, sessionId);
  if (lifecycle === 'BLOCKED' && !publication.blockedRoles.includes(role)) {
    publication.blockedRoles.push(role);
    if (!publication.participantRoles.includes(role)) publication.participantRoles.push(role);
    if (global.logDebug) global.logDebug('subagent_blocked', role);
    return { text: `${role} sinalizou um bloqueio que precisa de decisão.`, blocking: true };
  }
  if (lifecycle === 'COMPLETED' && !publication.completedRoles.includes(role)) {
    publication.completedRoles.push(role);
    if (!publication.participantRoles.includes(role)) publication.participantRoles.push(role);
    if (global.logDebug) global.logDebug('subagent_completed', role);
    return { text: getRoleProgressMessage(role, 'completed'), bypassInterval: true };
  }
  if (event.source === 'MODEL' && event.type === 'PLANNER_RESPONSE' && !publication.startedRoles.includes(role)) {
    publication.startedRoles.push(role);
    if (!publication.participantRoles.includes(role)) publication.participantRoles.push(role);
    if (global.logDebug) global.logDebug('subagent_activity', role);
    return { text: getRoleProgressMessage(role, 'started'), bypassInterval: true };
  }
  return null;
}

function beginExecution(client, threadTimestamp, channel, mappingEntry) {
  const publication = createPublicationState();
  mappingEntry.publication = publication;
  mappingEntry.subagents = {};
  if (mappingEntry.sessionId) publication.roleByConversation[mappingEntry.sessionId] = 'CEO';
  publishStatus(client, threadTimestamp, channel, publication, 'CEO está coordenando a solicitação.', { bypassInterval: true });
  return publication;
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

function saveMapping(mapping, MAPPING_PATH) {
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

function applyNewLines(filePath, threadTimestamp, rootExecution, transcriptState, isSubagent, client, mapping, MAPPING_PATH) {
  try {
    const events = readTranscriptLines(filePath, transcriptState);
    const publication = rootExecution.publication;
    if (!publication) return;
    for (const event of events) {
      if (isSubagent) {
        const status = applySubagentTranscriptEvent(event, publication, transcriptState.sessionId);
        if (status) publishStatus(client, threadTimestamp, rootExecution.channel, publication, status.text, status);
      } else {
        const status = applyRootTranscriptEvent(event, publication);
        if (status) publishStatus(client, threadTimestamp, rootExecution.channel, publication, status.text, status);
        if (event.type === 'GENERIC' && String(event.content || '').includes('Created the following subagents:')) {
          for (const conversationId of extractConversationIds(event.content)) {
            if (!publication.roleByConversation[conversationId]) continue;
            rootExecution.subagents[conversationId] = { offset: 0, sessionId: conversationId };
            const subagentPath = path.join(BRAIN_DIR, conversationId, '.system_generated', 'logs', 'transcript.jsonl');
            if (fs.existsSync(subagentPath)) applyNewLines(subagentPath, threadTimestamp, rootExecution, rootExecution.subagents[conversationId], true, client, mapping, MAPPING_PATH);
          }
        }
      }
    }
    if (MAPPING_PATH) saveMapping(mapping, MAPPING_PATH);
  } catch (error) {
    if (global.logDebug) global.logDebug('transcript_processing_failed');
  }
}

function reconcileRootSession(rootExecution, brainDir = BRAIN_DIR) {
  if (rootExecution.sessionId || !rootExecution.pendingId || !fs.existsSync(brainDir)) return null;
  const matchingTranscripts = [];
  for (const mappingEntry of fs.readdirSync(brainDir, { withFileTypes: true })) {
    if (!mappingEntry.isDirectory()) continue;
    const transcriptPath = path.join(brainDir, mappingEntry.name, '.system_generated', 'logs', 'transcript.jsonl');
    try {
      if (fs.existsSync(transcriptPath) && fs.readFileSync(transcriptPath, 'utf8').includes(rootExecution.pendingId)) {
        matchingTranscripts.push({ sessionId: mappingEntry.name, transcriptPath });
      }
    } catch {}
  }
  if (matchingTranscripts.length !== 1) return null;
  rootExecution.sessionId = matchingTranscripts[0].sessionId;
  rootExecution.offset = 0;
  delete rootExecution.pendingId;
  return matchingTranscripts[0].transcriptPath;
}

function applyRootTranscriptAtFinish(rootExecution, threadTimestamp, client, mapping, debugLogger, brainDir = BRAIN_DIR, MAPPING_PATH) {
  if (!rootExecution.sessionId) {
    const reconciledPath = reconcileRootSession(rootExecution, brainDir);
    if (!reconciledPath) {
      if (debugLogger) debugLogger('root_session_unmapped');
      return false;
    }
    if (debugLogger) debugLogger('root_session_reconciled');
    applyNewLines(reconciledPath, threadTimestamp, rootExecution, rootExecution, false, client, mapping, MAPPING_PATH);
    return true;
  }
  const rootPath = path.join(brainDir, rootExecution.sessionId, '.system_generated', 'logs', 'transcript.jsonl');
  if (!fs.existsSync(rootPath)) {
    if (debugLogger) debugLogger('root_transcript_missing');
    return false;
  }
  applyNewLines(rootPath, threadTimestamp, rootExecution, rootExecution, false, client, mapping, MAPPING_PATH);
  return true;
}

function reconcileRootTranscriptDuringExecution(rootExecution, threadTimestamp, client, mapping, debugLogger, brainDir = BRAIN_DIR, MAPPING_PATH) {
  if (rootExecution.sessionId) return false;
  const reconciledPath = reconcileRootSession(rootExecution, brainDir);
  if (!reconciledPath) return false;
  if (debugLogger) debugLogger('root_session_reconciled');
  applyNewLines(reconciledPath, threadTimestamp, rootExecution, rootExecution, false, client, mapping, MAPPING_PATH);
  return true;
}

module.exports = {
  ROOT_PROMPT_REPORTING_CONTRACT,
  DEBUG_EVENTS,
  ROOT_RECONCILIATION_INTERVAL_MS,
  MAX_NARRATIVES_PER_ROLE,
  WORKSPACE_DIR,
  BRAIN_DIR,
  createDebugLogger,
  createPublicationState,
  parseStreamSubagentEvent,
  createStreamJsonParser,
  extractRootConversationId,
  bindRootSessionFromInit,
  createRootPrompt,
  createAgyArguments,
  appendAgentResponseDelta,
  applyStreamAgentResponseEvent,
  applyRootTranscriptEvent,
  applySubagentTranscriptEvent,
  beginExecution,
  serializeMapping,
  saveMapping,
  clearAgentResponseBuffers,
  readTranscriptLines,
  applyNewLines,
  reconcileRootSession,
  applyRootTranscriptAtFinish,
  reconcileRootTranscriptDuringExecution
};
