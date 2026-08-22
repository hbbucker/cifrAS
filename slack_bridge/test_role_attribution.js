const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  createConsolidatedFinal,
  sanitizeIntermediateNarrative
} = require('./message_rendering');

const {
  createAgyArguments,
  createRootPrompt,
  ROOT_PROMPT_REPORTING_CONTRACT,
  beginExecution,
  createDebugLogger,
  createPublicationState,
  parseStreamSubagentEvent,
  serializeMapping,
  createStreamJsonParser,
  bindRootSessionFromInit,
  extractRootConversationId,
  reconcileRootSession,
  applyRootTranscriptEvent,
  applyStreamAgentResponseEvent,
  applyRootTranscriptAtFinish,
  applySubagentTranscriptEvent
} = require('./agy_execution');
const {
  ACKNOWLEDGEMENT_STATUS,
  QUEUED_STATUS,
  publishIntermediateNarrative,
  publishConsolidation,
  publishFinalWithUploads,
  publishAcknowledgement,
  publishQueuedStatus,
  publishStatus,
  waitForSlackQueue
} = require('./slack_delivery');
const {
  AGY_SUBAGENT_TYPE_ROLES
} = require('./role_attribution');


test('debug emits only a closed safe event schema and stays silent when disabled', () => {
  const disabledLines = [];
  const disabledLogger = createDebugLogger(false, (line) => disabledLines.push(line));
  disabledLogger('message_received');
  assert.deepEqual(disabledLines, []);

  const enabledLines = [];
  const enabledLogger = createDebugLogger(true, (line) => enabledLines.push(line));
  enabledLogger('message_received');
  enabledLogger('root_session_unmapped');
  enabledLogger('root_session_reconciled');
  enabledLogger('root_session_bound');
  enabledLogger('conversation_resumed');
  enabledLogger('root_transcript_missing');
  enabledLogger('final_skipped_no_root_response');
  enabledLogger('delegation_detected', 'CTO');
  enabledLogger('delegation_detected', 'secret-token /home/user/private conversation-123');
  enabledLogger('unrecognized_event', 'CPO');

  assert.deepEqual(enabledLines, [
    '[Slack Bridge debug] {"event":"message_received"}',
    '[Slack Bridge debug] {"event":"root_session_unmapped"}',
    '[Slack Bridge debug] {"event":"root_session_reconciled"}',
    '[Slack Bridge debug] {"event":"root_session_bound"}',
    '[Slack Bridge debug] {"event":"conversation_resumed"}',
    '[Slack Bridge debug] {"event":"root_transcript_missing"}',
    '[Slack Bridge debug] {"event":"final_skipped_no_root_response"}',
    '[Slack Bridge debug] {"event":"delegation_detected","role":"CTO"}',
    '[Slack Bridge debug] {"event":"delegation_detected"}',
  ]);
  assert.doesNotMatch(enabledLines.join('\n'), /secret-token|\/home|conversation-123/);
});

test('binds only a valid root init to its Slack thread and resumes only that thread', () => {
  const firstThread = { pendingId: 'slack_init_first', offset: 12, subagents: {} };
  const otherThread = { pendingId: 'slack_init_other', offset: 34, subagents: {} };
  const rootInit = { event: 'init', conversation_id: 'root-session-first' };

  assert.equal(extractRootConversationId(rootInit), 'root-session-first');
  assert.equal(bindRootSessionFromInit(rootInit, firstThread), true);
  assert.deepEqual(firstThread, { sessionId: 'root-session-first', offset: 0, subagents: {} });
  assert.equal(bindRootSessionFromInit(rootInit, firstThread), false);
  assert.equal(bindRootSessionFromInit({ event: 'init', conversation_id: '   ' }, otherThread), false);
  assert.equal(bindRootSessionFromInit({ event: 'result', conversation_id: 'root-session-other' }, otherThread), false);
  assert.equal(otherThread.sessionId, undefined);

  const sameThreadArgs = createAgyArguments('continuação da primeira thread', firstThread.sessionId);
  assert.deepEqual(sameThreadArgs.slice(-5), ['--conversation', 'root-session-first', '--print-timeout', '1h', '--dangerously-skip-permissions']);

  const differentThreadArgs = createAgyArguments('nova thread', otherThread.sessionId);
  assert.equal(differentThreadArgs.includes('--conversation'), false);
  assert.equal(differentThreadArgs.includes('root-session-first'), false);

  const secondThread = { sessionId: 'root-session-second' };
  const secondThreadArgs = createAgyArguments('continuação de outra thread', secondThread.sessionId);
  assert.deepEqual(secondThreadArgs.slice(-5), ['--conversation', 'root-session-second', '--print-timeout', '1h', '--dangerously-skip-permissions']);

  const debugLines = [];
  const debugLogger = createDebugLogger(true, (line) => debugLines.push(line));
  debugLogger('root_session_bound');
  debugLogger('conversation_resumed');
  assert.deepEqual(debugLines, [
    '[Slack Bridge debug] {"event":"root_session_bound"}',
    '[Slack Bridge debug] {"event":"conversation_resumed"}',
  ]);
  assert.doesNotMatch(debugLines.join('\n'), /root-session|slack_init/);
});

test('injects the safe reporting contract into both initial and resumed root prompts', () => {
  const initialPrompt = createRootPrompt('Planeje a próxima entrega.', 'slack_init_internal_marker');
  const resumedPrompt = createRootPrompt('Continue a análise.', '');
  const initialArgs = createAgyArguments(initialPrompt);
  const resumedArgs = createAgyArguments(resumedPrompt, 'root-session-private');

  for (const prompt of [initialPrompt, resumedPrompt]) {
    assert.match(prompt, /entendimento e abordagem/);
    assert.match(prompt, /resultado e pendências/);
    assert.match(prompt, /Não invente término/);
    assert.match(prompt, /Não inclua ferramentas/);
    assert.doesNotMatch(prompt, /conversation_id|file:\/\/|\/home|root-session-private/);
  }
  assert.equal(initialArgs[1], initialPrompt);
  assert.equal(initialArgs.includes('--conversation'), false);
  assert.equal(resumedArgs[1], resumedPrompt);
  assert.deepEqual(resumedArgs.slice(-5), ['--conversation', 'root-session-private', '--print-timeout', '1h', '--dangerously-skip-permissions']);
  assert.doesNotMatch(ROOT_PROMPT_REPORTING_CONTRACT, /conversation_id|file:\/\/|\/home|slack_init_internal_marker/);
});

test('starts a same-thread continuation with a fresh publication while retaining only its root session', () => {
  const client = { chat: { postMessage: async () => {} } };
  const previousPublication = createPublicationState();
  previousPublication.finalPublished = true;
  previousPublication.latestRootResponse = '# Resposta anterior';
  previousPublication.participantRoles.push('CTO');
  const mappingEntry = { sessionId: 'root-session-first', publication: previousPublication, subagents: { child: {} } };

  const publication = beginExecution(client, 'same-thread', 'channel', mappingEntry);
  assert.notEqual(publication, previousPublication);
  assert.equal(mappingEntry.sessionId, 'root-session-first');
  assert.equal(publication.finalPublished, false);
  assert.equal(publication.latestRootResponse, '');
  assert.deepEqual(publication.participantRoles, []);
  assert.deepEqual(mappingEntry.subagents, {});
  assert.equal(createConsolidatedFinal({ ...publication, latestRootResponse: '# Nova resposta' }), '**CEO — consolidação — nenhuma participação especialista confirmada nesta execução**\n\n# Nova resposta');
});

test('stream-json accepts the versioned canonical subagent types and keeps PO or unknown neutral', () => {
  const publication = createPublicationState();
  const events = [];
  const parser = createStreamJsonParser((event) => events.push(event));
  parser('{"event":"unknown"}\nnot-json\n{"event":"step_');
  parser('update","step_update":{"subagent_info":{"subagents":[{"type_name":"cpo_agent","role":"PO","conversation_id":"internal-id","log_uri":"file:///home/bucker/.gemini/antigravity-cli/brain/internal-id/transcript.jsonl"}]}}}\n');
  assert.equal(events.length, 2);
  const handoff = parseStreamSubagentEvent(events[1], publication);
  assert.deepEqual(handoff, { text: 'CEO acionou o CPO/UX para definir critérios e jornada.', bypassInterval: true, conversationId: 'internal-id' });
  assert.deepEqual(AGY_SUBAGENT_TYPE_ROLES, { cpo_agent: 'CPO', cto_agent: 'CTO', frontend_agent: 'Frontend Staff', qa_agent: 'QA Lead' });
  assert.deepEqual(applySubagentTranscriptEvent({ source: 'MODEL', type: 'PLANNER_RESPONSE' }, publication, handoff.conversationId), { text: 'CPO está definindo critérios de aceite e jornada.', bypassInterval: true });
  assert.equal(parseStreamSubagentEvent({ event: 'step_update', step_update: { subagent_info: { subagents: [{ type_name: 'cto_agent', conversation_id: 'other', log_uri: 'file:///tmp/outside' }] } } }, publication), null);
  assert.equal(parseStreamSubagentEvent({ event: 'step_update', step_update: { subagent_info: { subagents: [{ type_name: 'po_agent', conversation_id: 'po', log_uri: 'file:///home/bucker/.gemini/antigravity-cli/brain/po/transcript.jsonl' }] } } }, publication), null);
  assert.equal(parseStreamSubagentEvent({ event: 'step_update', step_update: { subagent_info: { subagents: [{ type_name: 'unknown_agent', conversation_id: 'unknown', log_uri: 'file:///home/bucker/.gemini/antigravity-cli/brain/unknown/transcript.jsonl' }] } } }, publication), null);
  assert.doesNotMatch(handoff.text, /internal-id|file:|home/);

  const trailingEvents = [];
  const trailingParser = createStreamJsonParser((event) => trailingEvents.push(event));
  trailingParser('{"event":"result"}');
  trailingParser.flush();
  assert.deepEqual(trailingEvents, [{ event: 'result' }]);
});

test('publishes only completed, ordered, safe agent-response narratives without tool noise', async () => {
  const calls = [];
  const client = { chat: { postMessage: async (payload) => calls.push(payload) } };
  const publication = createPublicationState();
  publication.roleByConversation['cpo-conversation'] = 'CPO';
  publication.roleByConversation['cto-conversation'] = 'CTO';

  const response = (conversationId, stepId, status, textDelta) => ({ event: 'step_update', step_update: { step_type: 'agent_response', conversation_id: conversationId, step_id: stepId, status, text_delta: textDelta } });
  assert.deepEqual(applyStreamAgentResponseEvent(response('cpo-conversation', 'first', 'ACTIVE', 'A jornada foi mapeada'), publication), []);
  assert.deepEqual(applyStreamAgentResponseEvent(response('cto-conversation', 'second', 'ACTIVE', 'A abordagem técnica foi delimitada.'), publication), []);
  assert.deepEqual(applyStreamAgentResponseEvent(response('cto-conversation', 'second', 'DONE', ''), publication), []);
  const narratives = applyStreamAgentResponseEvent(response('cpo-conversation', 'first', 'DONE', ' e os critérios foram organizados.'), publication);
  assert.deepEqual(narratives.map((narrative) => narrative.role), ['CPO', 'CTO']);
  for (const narrative of narratives) assert.equal(publishIntermediateNarrative(client, 'narrative-thread', 'channel', publication, narrative), true);
  assert.deepEqual(applyStreamAgentResponseEvent(response('cpo-conversation', 'first', 'DONE', ''), publication), []);
  assert.deepEqual(applyStreamAgentResponseEvent({ event: 'step_update', step_update: { step_type: 'tool_call', conversation_id: 'cpo-conversation', step_id: 'tool', status: 'DONE', text_delta: 'rm -rf / secret-token' } }, publication), []);
  publication.latestRootResponse = '# Entrega final';
  assert.equal(publishFinalWithUploads(client, 'narrative-thread', 'channel', publication), true);
  await waitForSlackQueue('narrative-thread');

  assert.deepEqual(calls.slice(0, 2).map((payload) => payload.blocks[0].text), [
    '**CPO — atualização durante o processamento**\n\nA jornada foi mapeada e os critérios foram organizados.',
    '**CTO — atualização durante o processamento**\n\nA abordagem técnica foi delimitada.',
  ]);
  assert.equal(calls[2].blocks[0].text, '# Entrega final');
  assert.deepEqual(publication.participantRoles, ['CPO', 'CTO']);
  assert.doesNotMatch(JSON.stringify(calls), /tool_call|rm -rf|secret-token|cpo-conversation/);
});

test('rejects agent-response narratives with internal data, commands, lifecycle claims, or unsafe size', () => {
  const unsafeNarratives = [
    'Use o token xoxb-secret para continuar.',
    'Abra file:///home/bucker/private.md.',
    'O conversation_id é interno.',
    'npm test retornou o output.',
    'A análise foi concluída e entregue.',
    'a'.repeat(751),
  ];
  for (const narrative of unsafeNarratives) assert.equal(sanitizeIntermediateNarrative(narrative), null);
  assert.equal(sanitizeIntermediateNarrative('A jornada foi organizada para a próxima etapa.'), 'A jornada foi organizada para a próxima etapa.');
});

test('does not persist buffered or published intermediate narratives in thread mapping', () => {
  const publication = createPublicationState();
  publication.agentResponseBuffers.internal = { text: 'token xoxb-private', role: 'CPO' };
  publication.agentResponseOrder.push('internal');
  publication.publishedNarratives.push('CPO:Resumo seguro');
  const serialized = serializeMapping({ thread: { publication } });
  assert.doesNotMatch(serialized, /xoxb-private|Resumo seguro|agentResponseBuffers|publishedNarratives/);
});

test('debug records a final skipped without a root response and no internal values', () => {
  const output = execFileSync(process.execPath, ['-e', "const ex = require('./agy_execution'); const dl = require('./slack_delivery'); global.logDebug = ex.createDebugLogger(); dl.publishFinalWithUploads({}, 'internal-thread', 'internal-channel', ex.createPublicationState());"], {
    cwd: __dirname,
    encoding: 'utf8',
    env: { ...process.env, SLACK_BRIDGE_DEBUG: '1' },
  });
  assert.equal(output, '[Slack Bridge debug] {"event":"final_skipped_no_root_response"}\n');
  assert.doesNotMatch(output, /internal-thread|internal-channel/);
});

test('debug distinguishes unmapped and missing root transcripts without identifiers', () => {
  const lines = [];
  const debugLogger = createDebugLogger(true, (line) => lines.push(line));
  assert.equal(applyRootTranscriptAtFinish({}, 'internal-thread', {}, {}, debugLogger), false);
  assert.equal(applyRootTranscriptAtFinish({ sessionId: 'internal-session' }, 'internal-thread', {}, {}, debugLogger), false);
  assert.deepEqual(lines, [
    '[Slack Bridge debug] {"event":"root_session_unmapped"}',
    '[Slack Bridge debug] {"event":"root_transcript_missing"}',
  ]);
  assert.doesNotMatch(lines.join('\n'), /internal-session|internal-thread/);
});

test('reconciles a pending root session before the final response is skipped', () => {
  const brainDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'slack-bridge-brain-'));
  const sessionId = 'reconciled-session';
  const transcriptPath = path.join(brainDirectory, sessionId, '.system_generated', 'logs', 'transcript.jsonl');
  const marker = 'slack_init_internal_marker';
  fs.mkdirSync(path.dirname(transcriptPath), { recursive: true });
  fs.writeFileSync(transcriptPath, `${JSON.stringify({ type: 'SYSTEM', content: marker })}\n${JSON.stringify({ source: 'MODEL', type: 'PLANNER_RESPONSE', content: '# Entrega reconciliada' })}\n`);
  const publication = createPublicationState();
  const rootExecution = { pendingId: marker, offset: 0, subagents: {}, publication };
  const lines = [];
  const debugLogger = createDebugLogger(true, (line) => lines.push(line));

  assert.equal(reconcileRootSession(rootExecution, brainDirectory), transcriptPath);
  for (const event of fs.readFileSync(transcriptPath, 'utf8').trim().split('\n').map(JSON.parse)) applyRootTranscriptEvent(event, publication);
  debugLogger('root_session_reconciled');
  assert.equal(rootExecution.sessionId, sessionId);
  assert.equal(rootExecution.pendingId, undefined);
  assert.equal(publication.latestRootResponse, '# Entrega reconciliada');
  assert.deepEqual(lines, ['[Slack Bridge debug] {"event":"root_session_reconciled"}']);
  assert.equal(reconcileRootSession(rootExecution, brainDirectory), null);
  fs.rmSync(brainDirectory, { recursive: true, force: true });
});

function delegationEvent(role) {
  return { source: 'MODEL', type: 'PLANNER_RESPONSE', tool_calls: [{ name: 'invoke_subagent', args: { Subagents: JSON.stringify([{ Role: role }]) } }] };
}

function associationEvent(conversationId) {
  return { type: 'INVOKE_SUBAGENT', content: `{"conversationId":"${conversationId}"}` };
}

function lifecycleEvent(conversationId, status, internalDetails = {}) {
  return { type: 'SUBAGENT_LIFECYCLE', metadata: { conversationId, status, ...internalDetails } };
}

function confirmRole(publication, role, conversationId) {
  applyRootTranscriptEvent(delegationEvent(role), publication);
  applyRootTranscriptEvent(associationEvent(conversationId), publication);
}

test('reports a busy thread once, then starts the deferred execution with CEO coordination', async () => {
  const calls = [];
  const client = { chat: { postMessage: async (payload) => calls.push(payload) } };
  const task = { mappingEntry: { publication: createPublicationState() } };
  assert.equal(publishAcknowledgement(client, 'busy-thread', 'channel', task.mappingEntry), true);
  assert.equal(publishAcknowledgement(client, 'busy-thread', 'channel', task.mappingEntry), false);
  assert.equal(publishQueuedStatus(client, 'busy-thread', 'channel', task), true);
  assert.equal(publishQueuedStatus(client, 'busy-thread', 'channel', task), false);
  beginExecution(client, 'busy-thread', 'channel', task.mappingEntry);
  await waitForSlackQueue('busy-thread');
  assert.deepEqual(calls.map((payload) => payload.text), [ACKNOWLEDGEMENT_STATUS, QUEUED_STATUS, 'CEO está coordenando a solicitação.']);
});

test('without a confirmed delegation, the public journey identifies only the CEO', async () => {
  const calls = [];
  const client = { chat: { postMessage: async (payload) => calls.push(payload) }, files: { uploadV2: async () => assert.fail('no upload expected') } };
  const publication = createPublicationState();
  publication.latestRootResponse = '# Entrega';
  publishStatus(client, 'no-delegation', 'channel', publication, 'CEO está coordenando a solicitação.', { bypassInterval: true });
  publishConsolidation(client, 'no-delegation', 'channel', publication);
  publication.latestRootResponse = createConsolidatedFinal(publication);
  publishFinalWithUploads(client, 'no-delegation', 'channel', publication);
  await waitForSlackQueue('no-delegation');

  assert.deepEqual(calls.map((payload) => payload.text), ['CEO está coordenando a solicitação.', 'CEO está consolidando a entrega.', 'CEO — consolidação — nenhuma participação especialista confirmada nesta execução\n\nEntrega']);
  assert.ok(calls.every((payload) => !/CPO|CTO|Frontend Staff|QA Lead/.test(payload.text)));
});

test('uses the literal CPO label and confirms participation only from a lifecycle event', () => {
  const publication = createPublicationState();
  const planned = applyRootTranscriptEvent(delegationEvent('CPO'), publication);
  assert.deepEqual(planned, { text: 'CEO acionou o CPO/UX para definir critérios e jornada.', bypassInterval: true });
  assert.deepEqual(publication.participantRoles, []);
  applyRootTranscriptEvent(associationEvent('conversation-cpo'), publication);
  assert.deepEqual(
    applySubagentTranscriptEvent({ source: 'MODEL', type: 'PLANNER_RESPONSE' }, publication, 'conversation-cpo'),
    { text: 'CPO está definindo critérios de aceite e jornada.', bypassInterval: true },
  );
  assert.equal(applySubagentTranscriptEvent(lifecycleEvent('conversation-cpo', 'COMPLETED'), publication, 'conversation-cpo').text, 'CPO concluiu a análise de produto.');
  assert.deepEqual(publication.participantRoles, ['CPO']);
  assert.equal(applySubagentTranscriptEvent(lifecycleEvent('conversation-cpo', 'COMPLETED'), publication, 'conversation-cpo'), null);
  assert.equal(applySubagentTranscriptEvent(lifecycleEvent('conversation-cpo', 'COMPLETED'), publication, 'other-session'), null);
});

test('rejects ambiguous or non-canonical associations without giving the CEO specialist credit', () => {
  const publication = createPublicationState();
  applyRootTranscriptEvent({ source: 'MODEL', type: 'PLANNER_RESPONSE', tool_calls: [{ name: 'invoke_subagent', args: { Subagents: JSON.stringify([{ Role: 'CTO' }, { Role: 'QA Lead' }]) } }] }, publication);
  applyRootTranscriptEvent({ type: 'INVOKE_SUBAGENT', content: '{"conversationId":"first"}{"conversationId":"second"}' }, publication);
  applyRootTranscriptEvent(delegationEvent('PO'), publication);
  applyRootTranscriptEvent(associationEvent('conversation-po'), publication);

  assert.deepEqual(publication.roleByConversation, {});
  assert.equal(publication.plannedRoles.length, 0);
  assert.equal(applySubagentTranscriptEvent(lifecycleEvent('first', 'COMPLETED'), publication, 'first'), null);
  publication.latestRootResponse = '# Entrega';
  assert.equal(createConsolidatedFinal(publication), '**CEO — consolidação — nenhuma participação especialista confirmada nesta execução**\n\n# Entrega');
});

test('uses a human delegation report and canonical activity for every specialist role', () => {
  const expected = {
    CTO: ['CEO enviou ao CTO a avaliação de viabilidade técnica.', 'CTO está avaliando a viabilidade técnica.', 'CTO concluiu a avaliação técnica.'],
    'Frontend Staff': ['CEO acionou o Frontend Staff para implementar a experiência.', 'Frontend Staff está implementando a experiência.', 'Frontend Staff concluiu a implementação da experiência.'],
    'QA Lead': ['CEO acionou o QA Lead para definir a validação independente.', 'QA Lead está conduzindo a validação independente.', 'QA Lead concluiu a validação independente.'],
  };
  for (const [role, messages] of Object.entries(expected)) {
    const publication = createPublicationState();
    const conversationId = `conversation-${role}`;
    assert.equal(applyRootTranscriptEvent(delegationEvent(role), publication).text, messages[0]);
    assert.deepEqual(publication.participantRoles, []);
    applyRootTranscriptEvent(associationEvent(conversationId), publication);
    assert.equal(applySubagentTranscriptEvent({ source: 'MODEL', type: 'PLANNER_RESPONSE' }, publication, conversationId).text, messages[1]);
    assert.equal(applySubagentTranscriptEvent(lifecycleEvent(conversationId, 'COMPLETED'), publication, conversationId).text, messages[2]);
  }
});

test('publishes one safe completion and one safe blocking status for the confirmed role', () => {
  const publication = createPublicationState();
  confirmRole(publication, 'CTO', 'conversation-cto');
  const completion = applySubagentTranscriptEvent(lifecycleEvent('conversation-cto', 'COMPLETED'), publication, 'conversation-cto');
  const duplicateCompletion = applySubagentTranscriptEvent(lifecycleEvent('conversation-cto', 'COMPLETED'), publication, 'conversation-cto');
  const blocked = applySubagentTranscriptEvent(lifecycleEvent('conversation-cto', 'BLOCKED', { command: 'rm -rf /', transcript: 'secret', token: 'hidden' }), publication, 'conversation-cto');
  const duplicateBlocked = applySubagentTranscriptEvent(lifecycleEvent('conversation-cto', 'BLOCKED'), publication, 'conversation-cto');

  assert.deepEqual(completion, { text: 'CTO concluiu a avaliação técnica.', bypassInterval: true });
  assert.equal(duplicateCompletion, null);
  assert.deepEqual(blocked, { text: 'CTO sinalizou um bloqueio que precisa de decisão.', blocking: true });
  assert.equal(duplicateBlocked, null);
  assert.deepEqual(publication.participantRoles, ['CTO']);
  assert.doesNotMatch(blocked.text, /rm -rf|secret|hidden|conversation-cto/);
});

test('applies status deduplication and interval without a global progress ceiling', async () => {
  const calls = [];
  const client = { chat: { postMessage: async (payload) => calls.push(payload) } };
  const publication = createPublicationState();
  assert.equal(publishStatus(client, 'status-policy', 'channel', publication, 'CEO está coordenando a solicitação.', { bypassInterval: true }), true);
  assert.equal(publishStatus(client, 'status-policy', 'channel', publication, 'CEO está coordenando a solicitação.', { bypassInterval: true }), false);
  assert.equal(publishStatus(client, 'status-policy', 'channel', publication, 'CTO está trabalhando na etapa atribuída.'), false);
  assert.equal(publishStatus(client, 'status-policy', 'channel', publication, 'CTO está trabalhando na etapa atribuída.', { bypassInterval: true }), true);
  assert.equal(publishStatus(client, 'status-policy', 'channel', publication, 'QA Lead está trabalhando na etapa atribuída.', { bypassInterval: true }), true);
  assert.equal(publishStatus(client, 'status-policy', 'channel', publication, 'CPO está trabalhando na etapa atribuída.', { bypassInterval: true }), true);
  assert.equal(publishStatus(client, 'status-policy', 'channel', publication, 'Frontend Staff está trabalhando na etapa atribuída.', { bypassInterval: true }), true);
  assert.equal(publishStatus(client, 'status-policy', 'channel', publication, 'QA Lead sinalizou um bloqueio que precisa de decisão.', { blocking: true }), true);
  await waitForSlackQueue('status-policy');
  assert.equal(calls.length, 6);
  assert.equal(calls.at(-1).text, 'QA Lead sinalizou um bloqueio que precisa de decisão.');
});

test('contract: reports the CEO handoff, confirmed activity, and useful final in the Slack thread', async () => {
  const calls = [];
  const client = { chat: { postMessage: async (payload) => calls.push(payload) }, files: { uploadV2: async () => assert.fail('no upload expected') } };
  const publication = createPublicationState();
  publishStatus(client, 'role-contract', 'channel-contract', publication, 'CEO está coordenando a solicitação.', { bypassInterval: true });
  const planned = applyRootTranscriptEvent(delegationEvent('CTO'), publication);
  publishStatus(client, 'role-contract', 'channel-contract', publication, planned.text, planned);
  applyRootTranscriptEvent(associationEvent('conversation-cto-contract'), publication);
  const started = applySubagentTranscriptEvent({ source: 'MODEL', type: 'PLANNER_RESPONSE' }, publication, 'conversation-cto-contract');
  publishStatus(client, 'role-contract', 'channel-contract', publication, started.text, started);
  publishConsolidation(client, 'role-contract', 'channel-contract', publication);
  publication.latestRootResponse = createConsolidatedFinal({ ...publication, latestRootResponse: '# Resultado' });
  publishFinalWithUploads(client, 'role-contract', 'channel-contract', publication);
  await waitForSlackQueue('role-contract');

  assert.deepEqual(calls.slice(0, 3).map((payload) => payload.text), ['CEO está coordenando a solicitação.', 'CEO enviou ao CTO a avaliação de viabilidade técnica.', 'CTO está avaliando a viabilidade técnica.']);
  assert.equal(calls[3].text, 'CEO está consolidando a entrega com contribuição de CTO.');
  assert.deepEqual(calls[4].blocks, [{ type: 'markdown', text: '**CEO — consolidação com participação confirmada de CTO**\n\n# Resultado' }]);
  assert.match(calls[4].text, /Resultado/);
  assert.ok(calls.every((payload) => payload.channel === 'channel-contract' && payload.thread_ts === 'role-contract'));
});
