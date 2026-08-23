const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');
const { EngineEvent } = require('../../../domain/events/EngineEvent');
const { TurnResultDTO } = require('../../../domain/dtos/TurnResultDTO');

class MockEngineAdapter extends ILLMEnginePort {
  /**
   * @param {Object} options
   * @param {AsyncIterable<EngineEvent>|Function} [options.events] - Lista ou gerador de eventos a serem emitidos
   */
  constructor({ events } = {}) {
    super();
    this.events = events;
  }

  async *executeStream(instruction) {
    if (typeof this.events === 'function') {
      yield* this.events(instruction);
      return;
    }

    if (Array.isArray(this.events)) {
      for (const event of this.events) {
        yield event;
      }
      return;
    }

    // Comportamento padrão de mock com ciclo de vida completo
    const sessionId = instruction.sessionId || 'mock-session-auto';
    yield EngineEvent.sessionBound(sessionId);
    yield EngineEvent.statusUpdated(sessionId, 'Analisando workspace');
    yield EngineEvent.textDeltaEmitted(sessionId, 'Iniciando raciocínio mock...');
    yield EngineEvent.executionCompleted(new TurnResultDTO({
      exitCode: 0,
      responseText: 'Resposta consolidada do mock.',
      filePaths: [],
    }));
  }
}

module.exports = { MockEngineAdapter };
