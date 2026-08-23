class EngineInstructionDTO {
  /**
   * @param {Object} params
   * @param {string} params.prompt - Prompt formatado com contratos de reporte.
   * @param {string} [params.sessionId=null] - ID da sessão prévia para continuidade.
   * @param {string} params.workspaceDir - Diretório absoluto do workspace.
   * @param {string} [params.uniqueId=null] - Token de idempotência/rastreabilidade.
   * @param {number} [params.timeoutMs=3600000] - Timeout da execução em milissegundos.
   */
  constructor({ prompt, sessionId = null, workspaceDir, uniqueId = null, timeoutMs = 3_600_000 }) {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new TypeError('EngineInstructionDTO: prompt must be a non-empty string');
    }
    if (!workspaceDir || typeof workspaceDir !== 'string') {
      throw new TypeError('EngineInstructionDTO: workspaceDir must be a valid string path');
    }
    this.prompt = prompt.trim();
    this.sessionId = sessionId ? String(sessionId).trim() : null;
    this.workspaceDir = workspaceDir;
    this.uniqueId = uniqueId ? String(uniqueId) : null;
    this.timeoutMs = Number(timeoutMs) || 3_600_000;
    Object.freeze(this);
  }
}

module.exports = { EngineInstructionDTO };
