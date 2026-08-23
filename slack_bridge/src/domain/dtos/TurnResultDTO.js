class TurnResultDTO {
  /**
   * @param {Object} params
   * @param {number} [params.exitCode=0] - Código de saída do processo
   * @param {string} [params.responseText=''] - Resposta consolidada final
   * @param {string[]} [params.filePaths=[]] - Arquivos identificados
   * @param {Error|null} [params.error=null] - Erro se houver
   * @param {Object} [params.metrics={}] - Métricas de execução
   */
  constructor({ exitCode = 0, responseText = '', filePaths = [], error = null, metrics = {} } = {}) {
    this.exitCode = typeof exitCode === 'number' ? exitCode : 0;
    this.responseText = typeof responseText === 'string' ? responseText : '';
    this.filePaths = Array.isArray(filePaths) ? Object.freeze([...filePaths]) : Object.freeze([]);
    this.error = error || null;
    this.metrics = metrics && typeof metrics === 'object' ? Object.freeze({ ...metrics }) : Object.freeze({});
    Object.freeze(this);
  }
}

module.exports = { TurnResultDTO };
