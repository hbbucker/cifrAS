/**
 * @interface INotificationPort
 * Contrato abstrato para envio de notificações, streaming e arquivos para o canal (Slack).
 */
class INotificationPort {
  async sendAcknowledgement(threadId, channelId) {
    throw new Error('INotificationPort.sendAcknowledgement() must be implemented');
  }

  async sendStatus(threadId, channelId, statusText, options = {}) {
    throw new Error('INotificationPort.sendStatus() must be implemented');
  }

  async sendIntermediateNarrative(threadId, channelId, agentRole, markdownText) {
    throw new Error('INotificationPort.sendIntermediateNarrative() must be implemented');
  }

  async sendFinalConsolidation(threadId, channelId, agentRole, markdownText, filePaths = []) {
    throw new Error('INotificationPort.sendFinalConsolidation() must be implemented');
  }

  async sendErrorMessage(threadId, channelId, errorText) {
    throw new Error('INotificationPort.sendErrorMessage() must be implemented');
  }
}

module.exports = { INotificationPort };
