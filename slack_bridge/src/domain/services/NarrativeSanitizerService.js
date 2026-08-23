const DEFAULT_SAFE_CHAR_LIMIT = 2900;

class NarrativeSanitizerService {
  constructor(charLimit = DEFAULT_SAFE_CHAR_LIMIT) {
    this.charLimit = charLimit;
  }

  sanitize(text) {
    let narrative = String(text || '').trim();
    if (!narrative) return null;

    // Bloqueia segredos conhecidos
    const hasSecrets = /(?:xox[baprs]-|sk-[A-Za-z0-9_-]+|AIza[\w-]+|\b(?:api[_ -]?key|authorization|bearer)\b)/i.test(narrative);
    if (hasSecrets) return null;

    // Bloqueia dumps curtos e brutos de ferramentas/comandos
    const isRawToolLeak = /^(?:```(?:bash|sh|json)\n)?\s*(?:npm|node|git|curl|wget|cat|grep|sed|awk|ls|view_file|replace_file_content|write_to_file)\b/im.test(narrative);
    if (isRawToolLeak && narrative.length < 200) return null;

    // Truncamento gracioso para limite do Slack
    if (narrative.length > this.charLimit) {
      narrative = narrative.substring(0, this.charLimit) + '...\n_(texto truncado pelo limite do Slack)_';
    }

    return narrative;
  }

  isDuplicate(role, narrativeText, publishedNarratives = []) {
    const key = `${role}:${String(narrativeText || '').trim()}`;
    return publishedNarratives.includes(key);
  }
}

module.exports = { NarrativeSanitizerService };
