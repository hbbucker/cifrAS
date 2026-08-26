const test = require('node:test');
const assert = require('node:assert/strict');
const { ProcessMessageUseCase } = require('../../../src/application/usecases/ProcessMessageUseCase');
const { MockEngineAdapter } = require('../../../src/adapters/engines/mock/MockEngineAdapter');
const { ThreadSession } = require('../../../src/domain/entities/ThreadSession');
const { EngineEvent } = require('../../../src/domain/events/EngineEvent');
const { TurnResultDTO } = require('../../../src/domain/dtos/TurnResultDTO');

class InMemoryThreadRepository {
  constructor() {
    this.sessions = new Map();
  }
  async getByThreadId(threadId) {
    return this.sessions.get(threadId) || null;
  }
  async save(session) {
    this.sessions.set(session.threadId, session);
  }
  async delete(threadId) {
    this.sessions.delete(threadId);
  }
}

class InMemoryNotificationService {
  constructor() {
    this.events = [];
  }
  async sendAcknowledgement(threadId, channelId) {
    this.events.push({ type: 'ack', threadId, channelId });
  }
  async sendStatus(threadId, channelId, text, options) {
    this.events.push({ type: 'status', threadId, channelId, text, options });
  }
  async sendIntermediateNarrative(threadId, channelId, role, markdown) {
    this.events.push({ type: 'narrative', threadId, channelId, role, markdown });
  }
  async sendMilestoneNotification(threadId, channelId, role, markdown) {
    this.events.push({ type: 'milestone', threadId, channelId, role, markdown });
  }
  async sendFinalConsolidation(threadId, channelId, role, markdown, filePaths) {
    this.events.push({ type: 'final', threadId, channelId, role, markdown, filePaths });
  }
  async setAssistantStatus(threadId, channelId, statusText) {
    this.events.push({ type: 'assistant_status', threadId, channelId, statusText });
  }
  async sendErrorMessage(threadId, channelId, errorText) {
    this.events.push({ type: 'error', threadId, channelId, errorText });
  }
}

test('ProcessMessageUseCase: dispatches MILESTONE_COMPLETED to notification gateway', async () => {
  const repository = new InMemoryThreadRepository();
  const notifier = new InMemoryNotificationService();

  const mockEngine = new MockEngineAdapter({
    events: async function* () {
      yield EngineEvent.sessionBound('mock-session-456');
      yield EngineEvent.subagentDiscovered('sub-cto-789', 'CTO');
      yield EngineEvent.milestoneCompleted('sub-cto-789', 'CTO', 'DTOs e migrações finalizados com sucesso.');
      yield EngineEvent.milestoneCompleted('mock-session-456', 'CEO', 'Branch criada e implementação iniciada.');
      yield EngineEvent.executionCompleted(new TurnResultDTO({
        exitCode: 0,
        responseText: 'Entrega final concluída com sucesso.',
        filePaths: [],
      }));
    },
  });

  const useCase = new ProcessMessageUseCase({
    llmEngine: mockEngine,
    notificationGateway: notifier,
    sessionRepository: repository,
    workspaceDir: '/test/workspace',
  });

  const result = await useCase.execute({
    threadId: '2000.3000',
    channelId: 'C_TEST',
    userText: 'crie uma branch nova e inicie a implementação',
  });

  assert.equal(result.success, true);

  const milestoneEvents = notifier.events.filter(e => e.type === 'milestone');
  assert.equal(milestoneEvents.length, 2);
  assert.ok(milestoneEvents[0].markdown.includes('DTOs e migrações'));
  assert.equal(milestoneEvents[0].role.name, 'CTO');
  assert.ok(milestoneEvents[1].markdown.includes('Branch criada'));
  assert.equal(milestoneEvents[1].role.name, 'CEO');

  // Marco duplicado não deve ser reenviado na consolidação final
  const finalEvents = notifier.events.filter(e => e.type === 'final');
  assert.equal(finalEvents.length, 1);
});

test('ProcessMessageUseCase: successfully orchestrates end-to-end turn with mock event stream', async () => {
  const repository = new InMemoryThreadRepository();
  const notifier = new InMemoryNotificationService();

  const mockEngine = new MockEngineAdapter({
    events: async function* () {
      yield EngineEvent.sessionBound('mock-session-123');
      yield EngineEvent.textDeltaEmitted('mock-session-123', 'Iniciando análise técnica');
      yield EngineEvent.subagentDiscovered('sub-conv-456', 'CTO');
      yield EngineEvent.textDeltaEmitted('sub-conv-456', 'Criando índices no banco');
      yield EngineEvent.executionCompleted(new TurnResultDTO({
        exitCode: 0,
        responseText: 'Entrega final concluída com sucesso.',
        filePaths: [],
      }));
    },
  });

  const useCase = new ProcessMessageUseCase({
    llmEngine: mockEngine,
    notificationGateway: notifier,
    sessionRepository: repository,
    workspaceDir: '/test/workspace',
  });

  const result = await useCase.execute({
    threadId: '1000.2000',
    channelId: 'C_TEST',
    userText: 'Por favor, crie os índices do banco',
  });

  assert.equal(result.success, true);
  assert.equal(result.sessionId, 'mock-session-123');

  // Verifica persistência da sessão
  const savedSession = await repository.getByThreadId('1000.2000');
  assert.ok(savedSession);
  assert.equal(savedSession.sessionId, 'mock-session-123');
  assert.equal(savedSession.participantRoles.includes('CTO'), true);

  // Verifica despachos para a notificação
  const ackEvent = notifier.events.find(e => e.type === 'ack');
  assert.ok(ackEvent);

  const statusEvents = notifier.events.filter(e => e.type === 'status');
  assert.ok(statusEvents.length >= 1);

  const finalEvent = notifier.events.find(e => e.type === 'final');
  assert.ok(finalEvent);
  assert.ok(finalEvent.markdown.includes('Entrega final concluída'));
});




test('ProcessMessageUseCase: handles engine failure and triggers session recovery', async () => {
  const repository = new InMemoryThreadRepository();
  const notifier = new InMemoryNotificationService();

  const existingSession = new ThreadSession({ threadId: '1000.2000', channelId: 'C_TEST', sessionId: 'broken-session-999' });
  await repository.save(existingSession);

  const failingEngine = new MockEngineAdapter({
    events: async function* () {
      yield EngineEvent.executionFailed(new Error('Timer conflict error'), 1);
    },
  });

  const useCase = new ProcessMessageUseCase({
    llmEngine: failingEngine,
    notificationGateway: notifier,
    sessionRepository: repository,
    workspaceDir: '/test/workspace',
  });

  const result = await useCase.execute({
    threadId: '1000.2000',
    channelId: 'C_TEST',
    userText: 'Mensagem seguinte',
  });

  assert.equal(result.success, false);

  // Verifica que a sessão quebrada foi resetada no repositório
  const recoveredSession = await repository.getByThreadId('1000.2000');
  assert.equal(recoveredSession.sessionId, null);

  // Verifica mensagem de aviso ao usuário
  const errorEvent = notifier.events.find(e => e.type === 'error');
  assert.ok(errorEvent);
  assert.ok(errorEvent.errorText.includes('reinicializado'));
});
