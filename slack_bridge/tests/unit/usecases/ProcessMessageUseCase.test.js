const test = require('node:test');
const assert = require('node:assert/strict');
const { ProcessMessageUseCase } = require('../../../src/application/usecases/ProcessMessageUseCase');
const { MockEngineAdapter } = require('../../../src/adapters/engines/mock/MockEngineAdapter');
const { ThreadSession } = require('../../../src/domain/entities/ThreadSession');

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
  async sendFinalConsolidation(threadId, channelId, role, markdown, filePaths) {
    this.events.push({ type: 'final', threadId, channelId, role, markdown, filePaths });
  }
  async sendErrorMessage(threadId, channelId, errorText) {
    this.events.push({ type: 'error', threadId, channelId, errorText });
  }
}

test('ProcessMessageUseCase: successfully orchestrates end-to-end turn with mock engine and neutral callbacks', async () => {
  const repository = new InMemoryThreadRepository();
  const notifier = new InMemoryNotificationService();
  const mockEngine = new MockEngineAdapter({
    onExecute: async (params, callbacks) => {
      callbacks.onSessionBound({ sessionId: 'mock-session-123' });
      callbacks.onStreamDelta({ conversationId: 'mock-session-123', textChunk: 'Iniciando análise técnica' });
      callbacks.onSubagentDiscovered({ conversationId: 'sub-conv-456', typeName: 'CTO' });
      callbacks.onStreamDelta({ conversationId: 'sub-conv-456', textChunk: 'Criando índices no banco' });
      return {
        exitCode: 0,
        responseText: 'Entrega final concluída com sucesso.',
        filePaths: [],
      };
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

  const narrativeEvents = notifier.events.filter(e => e.type === 'narrative');
  assert.ok(narrativeEvents.length >= 2);
  assert.equal(narrativeEvents[0].role.name, 'CEO');
  assert.equal(narrativeEvents[1].role.name, 'CTO');

  const finalEvent = notifier.events.find(e => e.type === 'final');
  assert.ok(finalEvent);
  assert.ok(finalEvent.markdown.includes('Entrega final concluída'));
});

test('ProcessMessageUseCase: handles engine failure and triggers session recovery', async () => {
  const repository = new InMemoryThreadRepository();
  const notifier = new InMemoryNotificationService();
  
  // Salva uma sessão prévia
  const existingSession = new ThreadSession({ threadId: '1000.2000', channelId: 'C_TEST', sessionId: 'broken-session-999' });
  await repository.save(existingSession);

  const failingEngine = new MockEngineAdapter({
    onExecute: async () => {
      return {
        exitCode: 1,
        responseText: '',
        error: new Error('Timer conflict error'),
      };
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
