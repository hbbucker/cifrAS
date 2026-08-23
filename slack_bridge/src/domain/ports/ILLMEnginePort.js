/**
 * @interface ILLMEnginePort
 * Contrato abstrato e neutro para qualquer motor de IA (Antigravity, Claude Code, Aider, OpenAI, etc.)
 */
class ILLMEnginePort {
  /**
   * Executa um turno no motor de LLM.
   * @param {Object} params
   * @param {string} params.prompt - Prompt formatado com contratos de reporte.
   * @param {string} [params.sessionId] - ID da sessão prévia para continuidade.
   * @param {string} params.workspaceDir - Diretório do workspace.
   * @param {string} [params.uniqueId] - Token único da requisição.
   * @param {Object} callbacks
   * @param {Function} [callbacks.onSessionBound] - Disparado quando o ID da sessão raiz é estabelecido: ({ sessionId }) => void
   * @param {Function} [callbacks.onSubagentDiscovered] - Disparado ao detectar subagente: ({ conversationId, typeName, metadata }) => void
   * @param {Function} [callbacks.onStreamDelta] - Disparado a cada chunk de streaming: ({ conversationId, textChunk }) => void
   * @param {Function} [callbacks.onStatusUpdate] - Disparado em mudanças de estado do motor: ({ conversationId, statusText }) => void
   * @returns {Promise<{ exitCode: number, responseText: string, error?: any, filePaths?: string[] }>}
   */
  async execute(params, callbacks) {
    throw new Error('ILLMEnginePort.execute() must be implemented');
  }
}

module.exports = { ILLMEnginePort };
