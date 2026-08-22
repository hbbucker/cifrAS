const CANONICAL_ROLES = new Set(['CPO', 'CTO', 'Frontend Staff', 'QA Lead']);

const AGY_SUBAGENT_TYPE_ROLES = Object.freeze({
  cpo_agent: 'CPO',
  cto_agent: 'CTO',
  frontend_agent: 'Frontend Staff',
  qa_agent: 'QA Lead',
});

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

function getConfirmedSubagentLifecycle(event, sessionId) {
  if (!event || event.type !== 'SUBAGENT_LIFECYCLE' || !event.metadata || event.metadata.conversationId !== sessionId) return null;
  return event.metadata.status === 'COMPLETED' || event.metadata.status === 'BLOCKED' ? event.metadata.status : null;
}

module.exports = {
  CANONICAL_ROLES,
  AGY_SUBAGENT_TYPE_ROLES,
  ROLE_PROGRESS_MESSAGES,
  parseDelegatedRole,
  getRoleProgressMessage,
  extractConversationIds,
  getConfirmedSubagentLifecycle
};
