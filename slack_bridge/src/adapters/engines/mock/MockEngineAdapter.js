const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');

class MockEngineAdapter extends ILLMEnginePort {
  constructor({ onExecute } = {}) {
    super();
    this.onExecute = onExecute || (async () => ({ exitCode: 0, responseText: 'Mock response', filePaths: [] }));
  }

  async execute(params, callbacks) {
    return this.onExecute(params, callbacks);
  }
}

module.exports = { MockEngineAdapter };
