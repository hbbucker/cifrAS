const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { AntigravityEngineAdapter } = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');
const { SlackDeliveryNotifier } = require('../../../src/adapters/notifiers/SlackDeliveryNotifier');
const { ProcessMessageUseCase } = require('../../../src/application/usecases/ProcessMessageUseCase');
const { ThreadSession } = require('../../../src/domain/entities/ThreadSession');

class InMemoryThreadRepository {
  constructor(session) {
    this.session = session;
  }

  async getByThreadId(threadId) {
    return this.session && this.session.threadId === threadId ? this.session : null;
  }

  async save(session) {
    this.session = session;
  }
}

function createChild(run) {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  setImmediate(() => run(child));
  return child;
}

function createSlackClient(publicPayloads, statuses) {
  return {
    assistant: {
      threads: {
        setStatus: async (payload) => {
          statuses.push(payload);
          return { ok: true };
        },
      },
    },
    chat: {
      postMessage: async (payload) => {
        publicPayloads.push(payload);
        return { ok: true, ts: String(publicPayloads.length) };
      },
      update: async (payload) => {
        publicPayloads.push(payload);
        return { ok: true };
      },
    },
    files: {
      uploadV2: async () => ({ ok: true }),
    },
  };
}

test('Antigravity quota Slack flow: publishes one safe terminal message and preserves conversation', async () => {
  const brainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-quota-integration-'));
  const sessionId = 'preserved-conversation';
  const transcriptDir = path.join(brainDir, sessionId, '.system_generated', 'logs');
  fs.mkdirSync(transcriptDir, { recursive: true });
  fs.writeFileSync(path.join(transcriptDir, 'transcript.jsonl'), [
    JSON.stringify({ type: 'PLANNER_RESPONSE', content: 'old response must not mask quota' }),
    JSON.stringify({ type: 'PLANNER_RESPONSE', content: 'manual retry completed' }),
  ].join('\n'));

  const spawnArguments = [];
  let spawnCount = 0;
  const spawnFn = (_binary, args) => {
    spawnArguments.push(args);
    spawnCount += 1;
    if (spawnCount === 1) {
      return createChild((child) => {
        child.stdout.emit('data', Buffer.from('{"event":"step_update","step_update":{"status_text":"partial"}}\n'));
        child.stderr.emit('data', Buffer.from('Individual quo'));
        child.stderr.emit('data', Buffer.from('ta reached. Resets in 21m'));
        child.stderr.emit('data', Buffer.from('41s. Individual quota reached.\nError ID: 2a2012ac-c0bd-41fc-b2c1-28965d8401cd'));
        child.emit('close', 0);
      });
    }
    return createChild((child) => child.emit('close', 0));
  };

  const initialSession = new ThreadSession({
    threadId: '123.456',
    channelId: 'C_QUOTA',
    sessionId,
    pendingId: 'pending-preserved',
    offset: 4,
    participantRoles: ['CEO', 'CTO'],
    publishedNarratives: ['CTO:existing narrative'],
    subagents: new Map([['sub-cto', { conversationId: 'sub-cto', role: 'CTO', offset: 3 }]]),
  });
  const repository = new InMemoryThreadRepository(initialSession);
  const publicPayloads = [];
  const statuses = [];
  const notifier = new SlackDeliveryNotifier({
    slackClient: createSlackClient(publicPayloads, statuses),
  });
  const useCase = new ProcessMessageUseCase({
    llmEngine: new AntigravityEngineAdapter({ brainDir, spawnFn }),
    notificationGateway: notifier,
    sessionRepository: repository,
    workspaceDir: '/controlled/workspace',
  });

  try {
    const quotaResult = await useCase.execute({
      threadId: '123.456',
      channelId: 'C_QUOTA',
      userText: 'quota fixture',
    });

    assert.equal(quotaResult.success, false);
    assert.equal(quotaResult.sessionId, sessionId);
    assert.equal(repository.session.sessionId, sessionId);
    assert.equal(repository.session.pendingId, 'pending-preserved');
    assert.equal(repository.session.offset, 4);
    assert.deepEqual(repository.session.participantRoles, ['CEO', 'CTO']);
    assert.deepEqual(repository.session.publishedNarratives, ['CTO:existing narrative']);
    assert.deepEqual([...repository.session.subagents], [
      ['sub-cto', { conversationId: 'sub-cto', role: 'CTO', offset: 3 }],
    ]);
    assert.equal(repository.session.isActive, false);
    assert.equal(publicPayloads.length, 1);
    assert.equal(
      publicPayloads[0].text,
      '⚠️ O limite individual do Antigravity foi atingido. A plataforma informou nova tentativa em aproximadamente 21 min 41 s. Sua sessão foi preservada.'
    );
    assert.equal(statuses.filter((payload) => payload.status === '').length, 1);
    assert.doesNotMatch(
      JSON.stringify([...publicPayloads, ...statuses]),
      /2a2012ac|Individual quota reached|old response|\/controlled\/workspace|--conversation/
    );

    const retryResult = await useCase.execute({
      threadId: '123.456',
      channelId: 'C_QUOTA',
      userText: 'manual retry',
    });
    assert.equal(retryResult.success, true);
    const conversationFlagIndex = spawnArguments[1].indexOf('--conversation');
    assert.equal(spawnArguments[1][conversationFlagIndex + 1], sessionId);
  } finally {
    fs.rmSync(brainDir, { recursive: true, force: true });
  }
});

test('Antigravity quota Slack flow: invalid duration uses the safe fallback', async () => {
  const publicPayloads = [];
  const statuses = [];
  const session = new ThreadSession({
    threadId: 'fallback-thread',
    channelId: 'C_QUOTA',
    sessionId: 'fallback-session',
  });
  const repository = new InMemoryThreadRepository(session);
  const adapter = new AntigravityEngineAdapter({
    spawnFn: () => createChild((child) => {
      child.stderr.emit('data', Buffer.from('Individual quota reached. Resets in 99m.'));
      child.emit('close', 1);
    }),
  });
  const useCase = new ProcessMessageUseCase({
    llmEngine: adapter,
    notificationGateway: new SlackDeliveryNotifier({
      slackClient: createSlackClient(publicPayloads, statuses),
    }),
    sessionRepository: repository,
  });

  const result = await useCase.execute({
    threadId: 'fallback-thread',
    channelId: 'C_QUOTA',
    userText: 'quota fixture without valid duration',
  });

  assert.equal(result.success, false);
  assert.equal(result.sessionId, 'fallback-session');
  assert.equal(publicPayloads.length, 1);
  assert.equal(
    publicPayloads[0].text,
    '⚠️ O limite individual do Antigravity foi atingido. Tente novamente mais tarde. Sua sessão foi preservada.'
  );
});

test('Antigravity quota Slack flow: generic engine failure keeps the existing recovery behavior', async () => {
  const publicPayloads = [];
  const statuses = [];
  const session = new ThreadSession({
    threadId: 'generic-failure-thread',
    channelId: 'C_GENERIC',
    sessionId: 'session-to-reset',
    participantRoles: ['CEO', 'CTO'],
  });
  const repository = new InMemoryThreadRepository(session);
  const adapter = new AntigravityEngineAdapter({
    spawnFn: () => createChild((child) => {
      child.stderr.emit('data', Buffer.from('Unrecognized provider failure'));
      child.emit('close', 2);
    }),
  });
  adapter.readTranscriptResponse = async () => '';
  const useCase = new ProcessMessageUseCase({
    llmEngine: adapter,
    notificationGateway: new SlackDeliveryNotifier({
      slackClient: createSlackClient(publicPayloads, statuses),
    }),
    sessionRepository: repository,
  });

  const result = await useCase.execute({
    threadId: 'generic-failure-thread',
    channelId: 'C_GENERIC',
    userText: 'generic failure fixture',
  });

  assert.equal(result.success, false);
  assert.equal(result.sessionId, null);
  assert.equal(repository.session.sessionId, null);
  assert.deepEqual(repository.session.participantRoles, ['CEO']);
  assert.equal(publicPayloads.length, 1);
  assert.match(publicPayloads[0].text, /contexto foi reinicializado/);
  assert.doesNotMatch(publicPayloads[0].text, /limite individual|sessão foi preservada/);
  assert.equal(statuses.filter((payload) => payload.status === '').length, 1);
});
