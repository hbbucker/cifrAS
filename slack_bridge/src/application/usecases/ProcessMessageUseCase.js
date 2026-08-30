const { ThreadSession } = require('../../domain/entities/ThreadSession');
const { AgentRole } = require('../../domain/value-objects/AgentRole');
const { GovernanceContract } = require('../../domain/value-objects/GovernanceContract');
const { NarrativeSanitizerService } = require('../../domain/services/NarrativeSanitizerService');
const { EngineInstructionDTO } = require('../../domain/dtos/EngineInstructionDTO');
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
    const instruction = new EngineInstructionDTO({
      prompt,
      sessionId: session.sessionId,
      workspaceDir: this.workspaceDir,
      uniqueId,
    });

    try {
      let finalResult = null;

      // 2. Itera de forma sequencial e atômica sobre o fluxo de eventos tipados
      for await (const event of this.llmEngine.executeStream(instruction)) {
        if (global.logDebug && event.type !== 'TEXT_DELTA_EMITTED') global.logDebug('USECASE PROCESSING EVENT:', event.type);
        switch (event.type) {
          case 'SESSION_BOUND': {
            session.bindSessionId(event.payload.sessionId);
            await this.sessionRepository.save(session);
            break;
          }

          case 'SUBAGENT_DISCOVERED': {
            const role = AgentRole.from(event.payload.typeName || 'Especialista');
            session.registerSubagent(event.payload.conversationId, role);
            await this.sessionRepository.save(session);

            const progressMsg = role.getProgressMessage('delegated');
            if (progressMsg) {
              await this.notificationGateway.sendStatus(threadId, channelId, progressMsg, { bypassInterval: true });
            }
            break;
          }

                    case 'TEXT_DELTA_EMITTED': {
            const { conversationId, textChunk } = event.payload;
            const role = session.getRoleForConversation(conversationId) || AgentRole.from('Especialista');
            await this.notificationGateway.streamNarrative(threadId, channelId, role, textChunk);
            break;
          }

          case 'MILESTONE_COMPLETED': {
            const { conversationId, milestoneText, roleName } = event.payload;
            const sanitized = this.sanitizerService.sanitize(milestoneText);
            if (!sanitized) break;

            const role = roleName ? AgentRole.from(roleName) : session.getRoleForConversation(conversationId);
            const duplicate = this.sanitizerService.isDuplicate(role.name, sanitized, session.publishedNarratives);
            if (duplicate) break;

            session.addPublishedNarrative(`${role.name}:${sanitized}`);
            await this.sessionRepository.save(session);

            if (conversationId === session.sessionId) {
              // Primary response from CEO (non-blocking)
              this.notificationGateway.sendPrimaryResponse(threadId, channelId, role, sanitized).catch(err => {
                if (global.logDebug) global.logDebug('Error sending primary response: ' + err.message);
              });
            } else {
              await this.notificationGateway.sendMilestoneNotification(threadId, channelId, role, sanitized);
            }
            break;
          }

          case 'STATUS_UPDATED': {
            await this.notificationGateway.sendStatus(threadId, channelId, event.payload.statusText);
            break;
          }

          case 'EXECUTION_COMPLETED': {
            finalResult = event.payload.result;
            break;
          }

          case 'EXECUTION_FAILED': {
            throw event.payload.error || new Error(`Engine process failed with code ${event.payload.exitCode}`);
          }
        }
      }

      if (!finalResult) {
        throw new Error('Engine execution completed without emitting TurnResult');
      }

      // 3. Consolidação Final
      const ceoRole = AgentRole.from('CEO');
      const sanitizedFinal = this.sanitizerService.sanitize(finalResult.responseText);
      const isAlreadyPublished = this.sanitizerService.isDuplicate(ceoRole.name, sanitizedFinal, session.publishedNarratives);

      if (!isAlreadyPublished || (finalResult.filePaths && finalResult.filePaths.length > 0)) {
        await this.notificationGateway.sendFinalConsolidation(
          threadId,
          channelId,
          ceoRole,
          isAlreadyPublished ? '' : finalResult.responseText,
          finalResult.filePaths || []
        );
      } else {
        await this.notificationGateway.setAssistantStatus(threadId, channelId, '');
      }

      session.markActive(false);
      await this.sessionRepository.save(session);

      return new ExecutionResultDTO({
        success: true,
        sessionId: session.sessionId,
        responseText: finalResult.responseText,
        filePaths: finalResult.filePaths || [],
      });
    } catch (error) {
      // 4. Tratamento de Recuperação (Auto-Recovery)
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
