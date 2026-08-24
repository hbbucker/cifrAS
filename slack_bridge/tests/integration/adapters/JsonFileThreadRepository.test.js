const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { JsonFileThreadRepository } = require('../../../src/adapters/repositories/JsonFileThreadRepository');
const { ThreadSession } = require('../../../src/domain/entities/ThreadSession');
const { AgentRole } = require('../../../src/domain/value-objects/AgentRole');

test('JsonFileThreadRepository: persists and reloads ThreadSession instances to JSON file', async () => {
  const tempFilePath = path.join(os.tmpdir(), `test_mapping_${Date.now()}.json`);
  const repository = new JsonFileThreadRepository(tempFilePath);

  const session = new ThreadSession({
    threadId: '9999.8888',
    channelId: 'C_REPO_TEST',
    sessionId: 'session-xyz',
    participantRoles: ['CEO', 'CTO'],
  });
  session.registerSubagent('conv-1', AgentRole.from('CTO'));

  await repository.save(session);

  assert.ok(fs.existsSync(tempFilePath));

  const reloaded = await repository.getByThreadId('9999.8888');
  assert.ok(reloaded);
  assert.equal(reloaded.threadId, '9999.8888');
  assert.equal(reloaded.sessionId, 'session-xyz');
  assert.equal(reloaded.participantRoles.includes('CTO'), true);

  await repository.delete('9999.8888');
  const afterDelete = await repository.getByThreadId('9999.8888');
  assert.equal(afterDelete, null);

  try { fs.unlinkSync(tempFilePath); } catch {}
});
