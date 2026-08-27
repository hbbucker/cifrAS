const { TurnResultDTO } = require('../dtos/TurnResultDTO');

/**
 * Evento formal emitido durante o ciclo de vida de streaming do motor de IA.
 */
class EngineEvent {
  constructor(type, payload = {}) {
    this.type = type;
    this.payload = Object.freeze({ ...payload });
    this.timestamp = Date.now();
    Object.freeze(this);
  }

  /**
   * Alocação ou identificação da sessão raiz.
   */
  static sessionBound(sessionId) {
    return new EngineEvent('SESSION_BOUND', { sessionId: String(sessionId).trim() });
  }

  /**
   * Instanciação / descoberta de um subagente especialista.
   */
  static subagentDiscovered(conversationId, typeName, metadata = {}) {
    return new EngineEvent('SUBAGENT_DISCOVERED', {
      conversationId: String(conversationId),
      typeName: typeName ? String(typeName) : null,
      metadata,
    });
  }

  /**
   * Delta de texto / raciocínio emitido por uma conversa específica.
   */
  static textDeltaEmitted(conversationId, textChunk) {
    return new EngineEvent('TEXT_DELTA_EMITTED', {
      conversationId: String(conversationId),
      textChunk: String(textChunk || ''),
    });
  }

  /**
   * Atualização de status operacional do motor.
   */
  static statusUpdated(conversationId, statusText) {
    return new EngineEvent('STATUS_UPDATED', {
      conversationId: conversationId ? String(conversationId) : null,
      statusText: String(statusText || ''),
    });
  }

  /**
   * Conclusão de um marco/passo cognitivo intermediário relevante.
   */
  static milestoneCompleted(conversationId, roleName, milestoneText, metadata = {}) {
    return new EngineEvent('MILESTONE_COMPLETED', {
      conversationId: String(conversationId),
      roleName: roleName ? String(roleName) : null,
      milestoneText: String(milestoneText || '').trim(),
      metadata,
    });
  }

  /**
   * Conclusão com sucesso do turno cognitivo.
   */
  static executionCompleted(resultDTO) {
    const dto = resultDTO instanceof TurnResultDTO ? resultDTO : new TurnResultDTO(resultDTO);
    return new EngineEvent('EXECUTION_COMPLETED', { result: dto });
  }

  /**
   * Falha terminal irrecuperável do motor.
   */
  static executionFailed(error, exitCode = 1) {
    return new EngineEvent('EXECUTION_FAILED', {
      error: error instanceof Error ? error : new Error(String(error || 'Execution failed')),
      exitCode: typeof exitCode === 'number' ? exitCode : 1,
    });
  }
}

module.exports = { EngineEvent };
