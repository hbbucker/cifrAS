const CANONICAL_ROLES = Object.freeze({
  CEO: { icon: '👔', name: 'CEO', isMaker: false, isChecker: false },
  CTO: { icon: '🛠️', name: 'CTO', isMaker: true, isChecker: false },
  CPO: { icon: '🎯', name: 'CPO', isMaker: false, isChecker: false },
  'QA Lead': { icon: '🛡️', name: 'QA Lead', isMaker: false, isChecker: true },
  'Frontend Staff': { icon: '🎨', name: 'Frontend Staff', isMaker: true, isChecker: false },
  'Backend Staff': { icon: '⚙️', name: 'Backend Staff', isMaker: true, isChecker: false },
  Orquestrador: { icon: '🧠', name: 'Orquestrador', isMaker: false, isChecker: false },
});

const ROLE_PROGRESS_MESSAGES = Object.freeze({
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
});

class AgentRole {
  constructor({ name, icon, isMaker = false, isChecker = false, isCanonical = false }) {
    this.name = name;
    this.icon = icon;
    this.isMaker = isMaker;
    this.isChecker = isChecker;
    this.isCanonical = isCanonical;
  }

  get formattedName() {
    if (!this.name) return '🤖 Sistema';
    return `${this.icon} ${this.name}`;
  }

  getProgressMessage(stage) {
    const stageMessages = ROLE_PROGRESS_MESSAGES[this.name];
    return stageMessages && stageMessages[stage] ? stageMessages[stage] : null;
  }

  static from(rawRole) {
    const str = String(rawRole || '').trim();
    if (!str) return new AgentRole({ name: '', icon: '🤖', isCanonical: false });

    for (const [canonicalName, meta] of Object.entries(CANONICAL_ROLES)) {
      if (str.toLowerCase() === canonicalName.toLowerCase() || str.toLowerCase().includes(canonicalName.toLowerCase())) {
        return new AgentRole({
          name: canonicalName,
          icon: meta.icon,
          isMaker: meta.isMaker,
          isChecker: meta.isChecker,
          isCanonical: true,
        });
      }
    }

    return new AgentRole({
      name: str,
      icon: '🤖',
      isMaker: false,
      isChecker: false,
      isCanonical: false,
    });
  }
}

module.exports = { AgentRole, CANONICAL_ROLES, ROLE_PROGRESS_MESSAGES };
