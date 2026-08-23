const { EngineInstructionDTO } = require('../dtos/EngineInstructionDTO');
const { EngineEvent } = require('../events/EngineEvent');

/**
 * @interface ILLMEnginePort
 * Porta secundária (driven/outbound port) para execução de motores de IA em modo streaming reativo.
 */
class ILLMEnginePort {
  /**
   * Executa uma instrução no motor de IA e emite eventos de ciclo de vida tipados através de um AsyncIterable.
   * @param {EngineInstructionDTO} instruction - DTO formal de entrada.
   * @returns {AsyncIterable<EngineEvent>} - Fluxo assíncrono iterável de eventos.
   */
  async *executeStream(instruction) {
    throw new Error('ILLMEnginePort.executeStream() must be implemented');
  }
}

module.exports = { ILLMEnginePort };
