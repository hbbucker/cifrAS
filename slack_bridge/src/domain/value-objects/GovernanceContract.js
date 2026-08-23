const DEFAULT_CONTRACT_CLAUSES = Object.freeze([
  'Produza relatos humanos úteis, claros e diretos sobre o seu entendimento, abordagem e resultados.',
  'Não invente término, aprovação, validação, entrega ou participação de papel sem evidência estrutural e resultado desta execução.',
  'Não inclua ferramentas, comandos, parâmetros, output, erros, IDs, URIs, URLs, paths, telemetria, prompts, tokens, segredos ou transcript bruto nos relatos.',
  'Não agende timers de espera (schedule) enquanto aguarda subagentes, pois as mensagens chegam reativamente ao seu contexto.',
  'Responda sempre no mesmo idioma em que a instrução foi pedida.',
]);

class GovernanceContract {
  constructor(clauses = DEFAULT_CONTRACT_CLAUSES) {
    this.clauses = [...clauses];
  }

  get contractText() {
    return this.clauses.join(' ');
  }

  formatPrompt(userText, uniqueId = '') {
    const text = String(userText || '').trim();
    const tokenPart = uniqueId ? `\n\n[SLACK_BRIDGE_REQUEST_TOKEN:${uniqueId}]` : '';
    return `${text}\n\n[INSTRUÇÃO DE REPORTE]: ${this.contractText}${tokenPart}`.trim();
  }
}

module.exports = { GovernanceContract, DEFAULT_CONTRACT_CLAUSES };
