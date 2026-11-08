const STATUS_INTERVAL_MS = 15_000;
const STATUS_MAX_CODE_POINTS = 120;
const INITIAL_STATUS = 'Preparando a análise…';

const SOURCE_PRIORITIES = Object.freeze({
  fallback: 100,
  heartbeat: 200,
  subagent: 300,
  engine: 400,
});

const OPERATIONAL_VERBS = Object.freeze([
  'analisando', 'revisando', 'executando', 'testando', 'validando',
  'verificando', 'investigando', 'preparando', 'planejando', 'organizando',
  'implementando', 'corrigindo', 'consultando', 'aguardando', 'consolidando',
  'analyzing', 'reviewing', 'running', 'testing', 'validating', 'checking',
  'investigating', 'preparing', 'planning', 'organizing', 'implementing',
  'fixing', 'consulting', 'waiting', 'consolidating',
]);

const COMMAND_NAMES = new Set([
  'apt', 'apt-get', 'awk', 'bash', 'brew', 'bun', 'cat', 'chmod', 'chown',
  'cp', 'curl', 'deno', 'docker', 'dotnet', 'env', 'find', 'git', 'go',
  'gradle', 'grep', 'head', 'java', 'kubectl', 'less', 'ls', 'make', 'mkdir',
  'more', 'mv', 'mvn', 'node', 'npm', 'npx', 'pkill', 'pnpm', 'powershell',
  'ps', 'pytest', 'python', 'python3', 'rg', 'rm', 'sed', 'service', 'sh',
  'source', 'sudo', 'systemctl', 'tail', 'tee', 'touch', 'wget', 'xargs',
  'yarn', 'zsh',
]);

const CLAUSE_CONNECTORS = new Set([
  'and', 'but', 'depois', 'e', 'enquanto', 'entao', 'however', 'mas', 'or',
  'ou', 'porem', 'then', 'while',
]);

const SUBAGENT_MESSAGES = new Set([
  'CEO acionou o CPO/UX para definir critérios e jornada.',
  'CEO enviou ao CTO a avaliação de viabilidade técnica.',
  'CEO acionou o Frontend Staff para implementar a experiência.',
  'CEO acionou o QA Lead para definir a validação independente.',
]);

const HEARTBEAT_STATUS = 'Aguardando novas atualizações da execução…';

const REJECTION_PATTERNS = Object.freeze([
  { reason: 'credential', pattern: /(?:xox[a-z]-|sk-|AIza|AKIA|Bearer\s|Authorization\s*[:=]|api[ _-]?key|\b(?:token|password|secret|credential|credencial|senha)\b|-----BEGIN [A-Z ]+PRIVATE KEY-----)/iu },
  { reason: 'environment_variable', pattern: /\b[A-Z][A-Z0-9_]{2,}\s*=/u },
  { reason: 'url', pattern: /(?:https?|file):\/\/\S+/iu },
  { reason: 'local_path', pattern: /(?:^|[^\p{L}\p{N}_.-])(?:~[\\/]|\.{0,2}[\\/]|(?:[\p{L}\p{N}_.-]+[\\/])+)[\p{L}\p{N}_.-]+(?=$|[^\p{L}\p{N}_.-])/u },
  { reason: 'file_reference', pattern: /\b[\p{L}\p{N}_.-]+\.[a-z][a-z0-9]{0,9}(?::\d+)?\b/iu },
  { reason: 'code', pattern: /```|`[^`]+`|(?:^|\s)\$\s+\S|(?:^|\s)--[a-z][\w-]*|(?:^|\s)[|<>]{1,3}(?:\s|$)/u },
  { reason: 'markdown', pattern: /[\[\]<>]|(?:^|\n)\s{0,3}(?:#{1,6}\s|>\s|[-+*]\s|\d+[.)]\s)|(?:^|\s)(?:-{3,}|\*{3,}|_{3,})(?:\s|$)|\\[*_#[\]()~>|-]/u },
  { reason: 'serialized_payload', pattern: /^\s*[\[{][\s\S]*[\]}]\s*$|(?:^|[,\s{])['"]?[a-z_][\w.-]*['"]?\s*:\s*(?:['"\d\[{]|true\b|false\b|null\b)|\b(?:status|type|id|event|payload|command|args?|exit_code|session_id)\s*[:=]\s*\S+/iu },
  { reason: 'diagnostic', pattern: /\b(?:stdout|stderr|stack trace|traceback|exception|error dump|tool call|tool output)\b|\btools?\s*:/iu },
  { reason: 'internal_reasoning', pattern: /\b(?:system prompt|user prompt|assistant prompt|chain of thought|reasoning|racioc[ií]nio|thoughts?|i think|vou pensar passo a passo|instru[cç][aã]o interna)\b/iu },
  { reason: 'prompt_marker', pattern: /^\s*(?:system|user|assistant|prompt)\s*:/iu },
]);

function foldForComparison(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createEquivalentKey(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .replace(/[.…!?:]+$/u, '')
    .trim();
}

function truncateStatus(value, maxCodePoints) {
  const codePoints = [...value];
  if (codePoints.length <= maxCodePoints) return value;

  const available = codePoints.slice(0, maxCodePoints - 1).join('');
  const wordBoundary = available.search(/\s+\S*$/u);
  const truncated = wordBoundary > 0 ? available.slice(0, wordBoundary) : available;
  return `${truncated.trimEnd()}…`;
}

class LiveStatusPolicy {
  constructor({ now = Date.now, intervalMs = STATUS_INTERVAL_MS, maxCodePoints = STATUS_MAX_CODE_POINTS } = {}) {
    this.now = now;
    this.intervalMs = intervalMs;
    this.maxCodePoints = maxCodePoints;
    this.states = new Map();
    this.nextIdentity = 1;
  }

  start(threadId, { protectedText = '' } = {}) {
    const identity = this.nextIdentity++;
    const candidate = this._createCandidate(INITIAL_STATUS, 'fallback', protectedText);
    const state = {
      phase: 'active',
      identity,
      current: candidate,
      displayedKey: '',
      pending: null,
      lastAttemptAt: null,
      protectedText: String(protectedText || ''),
    };
    this.states.set(threadId, state);
    return { type: 'send', identity, candidate };
  }

  evaluate(threadId, statusText, { source = 'engine' } = {}) {
    const state = this.states.get(threadId);
    if (!state || state.phase !== 'active') return { type: 'ignore', reason: 'inactive' };

    const candidate = this._createCandidate(statusText, source, state.protectedText);
    if (!candidate) return { type: 'ignore', reason: 'unsafe' };
    if (candidate.priority < state.current.priority) return { type: 'ignore', reason: 'lower_priority' };
    if (state.pending && candidate.priority < state.pending.priority) return { type: 'ignore', reason: 'lower_priority' };
    if (candidate.key === state.displayedKey || candidate.key === state.pending?.key) {
      return { type: 'ignore', reason: 'duplicate' };
    }

    state.current = candidate;
    state.pending = candidate;
    const elapsed = state.lastAttemptAt === null ? Number.POSITIVE_INFINITY : this.now() - state.lastAttemptAt;
    if (elapsed >= this.intervalMs) {
      state.pending = null;
      return { type: 'send', identity: state.identity, candidate };
    }

    return {
      type: 'schedule',
      identity: state.identity,
      dueAt: state.lastAttemptAt + this.intervalMs,
      delayMs: this.intervalMs - elapsed,
    };
  }

  consumePending(threadId, identity) {
    const state = this.states.get(threadId);
    if (!state || state.phase !== 'active' || state.identity !== identity || !state.pending) {
      return { type: 'ignore', reason: 'stale' };
    }

    const elapsed = state.lastAttemptAt === null ? Number.POSITIVE_INFINITY : this.now() - state.lastAttemptAt;
    if (elapsed < this.intervalMs) {
      return {
        type: 'schedule',
        identity,
        dueAt: state.lastAttemptAt + this.intervalMs,
        delayMs: this.intervalMs - elapsed,
      };
    }

    const candidate = state.pending;
    state.pending = null;
    return { type: 'send', identity, candidate };
  }

  prepareAttempt(threadId, identity, candidate) {
    const state = this.states.get(threadId);
    if (!state || state.phase !== 'active' || state.identity !== identity) {
      return { type: 'ignore', reason: 'stale' };
    }
    if (candidate.source !== 'fallback' && state.current.key !== candidate.key && state.current.priority >= candidate.priority) {
      return { type: 'ignore', reason: 'superseded' };
    }

    const elapsed = state.lastAttemptAt === null ? Number.POSITIVE_INFINITY : this.now() - state.lastAttemptAt;
    if (candidate.source !== 'fallback' && elapsed < this.intervalMs) {
      if (!state.pending || candidate.priority > state.pending.priority) state.pending = candidate;
      return {
        type: 'schedule',
        identity,
        dueAt: state.lastAttemptAt + this.intervalMs,
        delayMs: this.intervalMs - elapsed,
      };
    }

    state.lastAttemptAt = this.now();
    return { type: 'send', identity, candidate };
  }

  recordSuccessfulDisplay(threadId, identity, candidate) {
    const state = this.states.get(threadId);
    if (!state || state.phase !== 'active' || state.identity !== identity) return false;
    state.displayedKey = candidate.key;
    return true;
  }

  markDisplayCleared(threadId) {
    const state = this.states.get(threadId);
    if (!state || state.phase !== 'active') return false;
    state.displayedKey = '';
    return true;
  }

  finish(threadId) {
    const state = this.states.get(threadId);
    if (!state || state.phase === 'terminal') return { type: 'ignore', reason: 'terminal' };
    state.phase = 'terminal';
    state.pending = null;
    return { type: 'clear', identity: state.identity };
  }

  isActive(threadId, identity) {
    const state = this.states.get(threadId);
    return Boolean(state && state.phase === 'active' && state.identity === identity);
  }

  _createCandidate(statusText, source, protectedText) {
    const priority = SOURCE_PRIORITIES[source];
    if (!priority) return null;

    const trustedText = this._resolveTrustedText(statusText, source);
    if (trustedText) {
      return { source, priority, text: trustedText, key: createEquivalentKey(trustedText) };
    }
    if (source !== 'engine') return null;

    const normalizedInput = String(statusText || '').normalize('NFKC');
    if (!normalizedInput.trim() || this._findRejectionReason(normalizedInput)) return null;

    let normalized = normalizedInput
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .replace(/[*_#~]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!normalized || !this._isOperational(normalized, source) || this._echoesProtectedText(normalized, protectedText)) {
      return null;
    }

    const text = truncateStatus(normalized, this.maxCodePoints);
    return { source, priority, text, key: createEquivalentKey(text) };
  }

  _findRejectionReason(value) {
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/u.test(value)) return 'invisible_control';
    if (REJECTION_PATTERNS.some(({ pattern }) => pattern.test(value))) return 'prohibited_content';
    if (foldForComparison(value).split(' ').some((token) => COMMAND_NAMES.has(token))) return 'command';

    const letters = (value.match(/\p{L}/gu) || []).length;
    const nonWhitespace = (value.match(/\S/gu) || []).length;
    if (nonWhitespace > 0 && letters / nonWhitespace < 0.35) return 'predominantly_non_textual';
    return null;
  }

  _isOperational(value, source) {
    if (source !== 'engine') return false;

    const withoutTerminalPunctuation = value.replace(/[.!?…]+$/u, '');
    if (!withoutTerminalPunctuation || /[,.!?…:;]/u.test(withoutTerminalPunctuation)) return false;
    if (!/^[\p{L}\p{N}][\p{L}\p{M}\p{N}'’ \-–—]*$/u.test(withoutTerminalPunctuation)) return false;

    const tokens = foldForComparison(withoutTerminalPunctuation).split(' ').filter(Boolean);
    if (tokens.length < 2 || !OPERATIONAL_VERBS.includes(tokens[0])) return false;
    if (tokens.some((token) => CLAUSE_CONNECTORS.has(token))) return false;
    return tokens.slice(1).some((token) => [...token].filter((character) => /\p{L}/u.test(character)).length >= 2);
  }

  _resolveTrustedText(statusText, source) {
    const normalized = String(statusText || '').normalize('NFKC');
    if (source === 'fallback' && normalized === INITIAL_STATUS.normalize('NFKC')) return INITIAL_STATUS;
    if (source === 'heartbeat' && normalized === HEARTBEAT_STATUS.normalize('NFKC')) return HEARTBEAT_STATUS;
    if (source === 'subagent') {
      return [...SUBAGENT_MESSAGES].find((message) => normalized === message.normalize('NFKC')) || null;
    }
    return null;
  }

  _echoesProtectedText(candidate, protectedText) {
    const foldedCandidate = foldForComparison(candidate);
    const foldedProtected = foldForComparison(protectedText);
    if (foldedCandidate.length < 12 || !foldedProtected) return false;
    if (foldedProtected.includes(foldedCandidate) || foldedCandidate.includes(foldedProtected)) return true;

    const candidateTokens = foldedCandidate.split(' ');
    const protectedTokens = foldedProtected.split(' ');
    const protectedSequences = new Set();
    for (let index = 0; index <= protectedTokens.length - 4; index += 1) {
      protectedSequences.add(protectedTokens.slice(index, index + 4).join(' '));
    }
    for (let index = 0; index <= candidateTokens.length - 4; index += 1) {
      const sequence = candidateTokens.slice(index, index + 4).join(' ');
      if (protectedSequences.has(sequence)) return true;
    }
    return false;
  }
}

module.exports = {
  LiveStatusPolicy,
  HEARTBEAT_STATUS,
  INITIAL_STATUS,
  SOURCE_PRIORITIES,
  STATUS_INTERVAL_MS,
  STATUS_MAX_CODE_POINTS,
};
