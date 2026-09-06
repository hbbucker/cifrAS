const { ThreadSession } = require('../../domain/entities/ThreadSession');
const { AgentRole } = require('../../domain/value-objects/AgentRole');
const { GovernanceContract } = require('../../domain/value-objects/GovernanceContract');
const { NarrativeSanitizerService } = require('../../domain/services/NarrativeSanitizerService');
const { EngineInstructionDTO } = require('../../domain/dtos/EngineInstructionDTO');
const { EngineQuotaExhaustedError } = require('../../domain/errors/EngineQuotaExhaustedError');
const { ExecutionResultDTO } = require('../dtos/IncomingMessageDTO');

function formatRetryDuration(retryAfterSeconds) {
  const hours = Math.floor(retryAfterSeconds / 3600);
  const minutes = Math.floor((retryAfterSeconds % 3600) / 60);
  const seconds = retryAfterSeconds % 60;
  const components = [];
  if (hours > 0) components.push(`${hours} h`);
  if (minutes > 0) components.push(`${minutes} min`);
  if (seconds > 0) components.push(`${seconds} s`);
  return components.join(' ');
}

function buildQuotaMessage(retryAfterSeconds) {
  if (Number.isInteger(retryAfterSeconds) && retryAfterSeconds > 0) {
    const duration = formatRetryDuration(retryAfterSeconds);
    return `⚠️ O limite individual do Antigravity foi atingido. A plataforma informou nova tentativa em aproximadamente ${duration}. Sua sessão foi preservada.`;
  }
  return '⚠️ O limite individual do Antigravity foi atingido. Tente novamente mais tarde. Sua sessão foi preservada.';
}

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

    let heartbeatInterval = null;
    let lastActivityTime = Date.now();

    try {
      let finalResult = null;

      heartbeatInterval = setInterval(async () => {
        const elapsed = Date.now() - lastActivityTime;
        if (elapsed >= 35_000) {
          try {
            await this.notificationGateway.sendStatus(
              threadId,
              channelId,
              '⏳ CEO e especialistas continuam trabalhando na sua solicitação...',
              { bypassInterval: true }
            );
          } catch {}
        }
      }, 35_000);
      if (heartbeatInterval.unref) heartbeatInterval.unref();

      // 2. Itera de forma sequencial e atômica sobre o fluxo de eventos tipados
      for await (const event of this.llmEngine.executeStream(instruction)) {
        lastActivityTime = Date.now();
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
      if (error instanceof EngineQuotaExhaustedError) {
        session.markActive(false);
        await this.sessionRepository.save(session);

        await this.notificationGateway.sendErrorMessage(
          threadId,
          channelId,
          buildQuotaMessage(error.retryAfterSeconds)
        );

        return new ExecutionResultDTO({
          success: false,
          sessionId: session.sessionId,
          error,
        });
      }

      // 4. Tratamento de Recuperação Não-Destrutivo (Preservação de Sessão)
      session.markActive(false);
      await this.sessionRepository.save(session);

      const errorMessage = (error && error.message && error.message.includes('timed out'))
        ? '⚠️ O tempo limite de inatividade (5 minutos sem resposta) foi atingido. Sua sessão foi preservada. Você pode enviar uma nova instrução para continuar.'
        : '⚠️ Ocorreu uma interrupção durante a execução. Sua sessão foi preservada. Por favor, tente enviar sua mensagem novamente.';

      await this.notificationGateway.sendErrorMessage(
        threadId,
        channelId,
        errorMessage
      );

      return new ExecutionResultDTO({
        success: false,
        sessionId: session.sessionId,
        error,
      });
    } finally {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    }
  }
}

module.exports = { ProcessMessageUseCase };
