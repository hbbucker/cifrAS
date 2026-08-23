const { ThreadSession } = require('../../domain/entities/ThreadSession');
const { AgentRole } = require('../../domain/value-objects/AgentRole');
const { GovernanceContract } = require('../../domain/value-objects/GovernanceContract');
const { NarrativeSanitizerService } = require('../../domain/services/NarrativeSanitizerService');
const { ExecutionResultDTO } = require('../dtos/IncomingMessageDTO');

class ProcessMessageUseCase {
  constructor({
    llmEngine,
    notificationGateway,
    sessionRepository,
    workspaceDir = process.cwd(),
    governanceContract = new GovernanceContract(),
    sanitizerService = new NarrativeSanitizerService(),
  }) {
    this.llmEngine = llmEngine;
    this.notificationGateway = notificationGateway;
    this.sessionRepository = sessionRepository;
    this.workspaceDir = workspaceDir;
    this.governanceContract = governanceContract;
    this.sanitizerService = sanitizerService;
  }

  async execute({ threadId, channelId, userText }) {
    let session = await this.sessionRepository.getByThreadId(threadId);
    if (!session) {
      session = new ThreadSession({ threadId, channelId });
    } else {
      session.channelId = channelId;
    }

    session.markActive(true);
    await this.sessionRepository.save(session);

    // 1. Envia Reconhecimento Imediato
    await this.notificationGateway.sendAcknowledgement(threadId, channelId);

    const uniqueId = session.sessionId ? '' : `init_${Date.now()}`;
    const prompt = this.governanceContract.formatPrompt(userText, uniqueId);

    try {
      // 2. Executa o motor com callbacks reativos
      const result = await this.llmEngine.execute(
        {
          prompt,
          sessionId: session.sessionId,
          workspaceDir: this.workspaceDir,
          uniqueId,
        },
        {
          onSessionBound: (boundId) => {
            session.bindSessionId(boundId);
            this.sessionRepository.save(session);
          },
          onSubagentSpawned: async (roleName, conversationId) => {
            const role = AgentRole.from(roleName);
            session.registerSubagent(conversationId, role);
            await this.sessionRepository.save(session);
            const progressMsg = role.getProgressMessage('delegated');
            if (progressMsg) {
              await this.notificationGateway.sendStatus(threadId, channelId, progressMsg, { bypassInterval: true });
            }
          },
          onStreamDelta: async (roleName, textDelta) => {
            const sanitized = this.sanitizerService.sanitize(textDelta);
            if (!sanitized) return;

            const role = AgentRole.from(roleName);
            const duplicate = this.sanitizerService.isDuplicate(role.name, sanitized, session.publishedNarratives);
            if (duplicate) return;

            session.addPublishedNarrative(`${role.name}:${sanitized}`);
            await this.notificationGateway.sendIntermediateNarrative(threadId, channelId, role, sanitized);
          },
          onStatusUpdate: async (roleName, statusText) => {
            await this.notificationGateway.sendStatus(threadId, channelId, statusText);
          },
        }
      );

      // 3. Verifica sucesso
      if (result.exitCode !== 0 && !result.responseText) {
        throw result.error || new Error(`Engine process failed with exit code ${result.exitCode}`);
      }

      // 4. Consolidação Final
      const ceoRole = AgentRole.from('CEO');
      await this.notificationGateway.sendFinalConsolidation(
        threadId,
        channelId,
        ceoRole,
        result.responseText,
        result.filePaths || []
      );

      session.markActive(false);
      await this.sessionRepository.save(session);

      return new ExecutionResultDTO({
        success: true,
        sessionId: session.sessionId,
        responseText: result.responseText,
        filePaths: result.filePaths || [],
      });
    } catch (error) {
      // 5. Tratamento de Recuperação (Auto-Recovery)
      if (session.sessionId) {
        session.resetSession();
        await this.sessionRepository.save(session);
      }
      session.markActive(false);

      await this.notificationGateway.sendErrorMessage(
        threadId,
        channelId,
        '⚠️ Houve uma interrupção na sessão anterior. O contexto foi reinicializado. Por favor, envie sua mensagem novamente.'
      );

      return new ExecutionResultDTO({
        success: false,
        error,
      });
    }
  }
}

module.exports = { ProcessMessageUseCase };
