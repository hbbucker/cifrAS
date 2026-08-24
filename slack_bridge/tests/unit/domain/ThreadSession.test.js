const test = require('node:test');
const assert = require('node:assert/strict');
const { ThreadSession } = require('../../../src/domain/entities/ThreadSession');
const { AgentRole } = require('../../../src/domain/value-objects/AgentRole');

test('ThreadSession: creates new session with initial state and manages subagents', () => {
  const session = new ThreadSession({ threadId: '12345.6789', channelId: 'C123' });
  assert.equal(session.threadId, '12345.6789');
  assert.equal(session.channelId, 'C123');
  assert.equal(session.isActive, false);
  assert.equal(session.sessionId, null);

  session.bindSessionId('session-abc-123');
  assert.equal(session.sessionId, 'session-abc-123');

  session.registerSubagent('conv-456', AgentRole.from('CTO'));
  assert.equal(session.getRoleForConversation('conv-456').name, 'CTO');
  assert.equal(session.participantRoles.includes('CTO'), true);

  session.markActive(true);
  assert.equal(session.isActive, true);

  session.resetSession();
  assert.equal(session.sessionId, null);
  assert.equal(session.subagents.size, 0);
});

test('ThreadSession: tracks published narratives and participant roles', () => {
  const session = new ThreadSession({ threadId: '12345.6789', channelId: 'C123' });
  session.addPublishedNarrative('CEO:Iniciando');
  assert.equal(session.hasPublishedNarrative('CEO:Iniciando'), true);
  assert.equal(session.hasPublishedNarrative('CEO:Outro'), false);
});
