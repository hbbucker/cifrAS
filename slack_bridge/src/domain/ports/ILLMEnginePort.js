/**
 * @interface ILLMEnginePort
 * Contrato abstrato para qualquer motor de IA (Antigravity, Claude Code, Aider, etc.)
 */
class ILLMEnginePort {
  /**
   * Executa um turno no motor de LLM.
   * @param {Object} params
   * @param {string} params.prompt - Prompt formatado com contratos de reporte.
   * @param {string} [params.sessionId] - ID da sessão prévia para continuidade.
   * @param {string} params.workspaceDir - Diretório do workspace.
   * @param {Object} callbacks
   * @param {Function} [callbacks.onSessionBound] - Disparado quando o ID da sessão é estabelecido: (sessionId) => void
   * @param {Function} [callbacks.onSubagentSpawned] - Disparado ao detectar subagente: (role, conversationId) => void
   * @param {Function} [callbacks.onStreamDelta] - Disparado a cada delta de pensamento/texto: (role, textChunk) => void
   * @param {Function} [callbacks.onStatusUpdate] - Disparado em mudanças de estado: (role, statusText) => void
   * @returns {Promise<{ exitCode: number, responseText: string, error?: any }>}
   */
  async execute(params, callbacks) {
    throw new Error('ILLMEnginePort.execute() must be implemented');
  }
}

module.exports = { ILLMEnginePort };
