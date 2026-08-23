const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { EventEmitter } = require('node:events');
const { AntigravityEngineAdapter } = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');

test('AntigravityEngineAdapter: handles subprocess lifecycle, stream events and emits neutral callbacks', async () => {
  const tempBrainDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy_test_brain_'));
  const testSessionId = 'test-session-uuid-123';
  const transcriptDir = path.join(tempBrainDir, testSessionId, '.system_generated', 'logs');
  fs.mkdirSync(transcriptDir, { recursive: true });

  const transcriptContent = [
    JSON.stringify({ type: 'USER_INPUT', content: 'hello' }),
    JSON.stringify({ type: 'PLANNER_RESPONSE', content: 'Resposta final do CEO testada com sucesso.' }),
  ].join('\n');
  fs.writeFileSync(path.join(transcriptDir, 'transcript.jsonl'), transcriptContent);

  const mockSpawn = () => {
    const mockChild = new EventEmitter();
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();

    setImmediate(() => {
      mockChild.stdout.emit('data', Buffer.from(`{"event":"init","conversation_id":"${testSessionId}"}\n`));
      mockChild.stdout.emit('data', Buffer.from('{"event":"step_update","step_update":{"subagent_info":{"subagents":[{"role":"CTO","conversation_id":"sub-1"}]}}}\n'));
      mockChild.stdout.emit('data', Buffer.from('{"event":"step_update","step_update":{"step_type":"agent_response","conversation_id":"sub-1","text_delta":"Trabalhando..."}}\n'));
      mockChild.emit('close', 0);
    });

    return mockChild;
  };

  const adapter = new AntigravityEngineAdapter({
    brainDir: tempBrainDir,
    agyBin: 'node',
    spawnFn: mockSpawn,
  });

  let boundSession = null;
  let discoveredSubagent = null;
  let streamedDelta = null;

  try {
    const result = await adapter.execute(
      { prompt: 'teste', workspaceDir: tempBrainDir },
      {
        onSessionBound: (payload) => { boundSession = payload; },
        onSubagentDiscovered: (payload) => { discoveredSubagent = payload; },
        onStreamDelta: (payload) => { streamedDelta = payload; },
      }
    );

    assert.equal(result.exitCode, 0);
    assert.deepEqual(boundSession, { sessionId: testSessionId });
    assert.equal(discoveredSubagent.conversationId, 'sub-1');
    assert.equal(discoveredSubagent.typeName, 'CTO');
    assert.deepEqual(streamedDelta, { conversationId: 'sub-1', textChunk: 'Trabalhando...' });
    assert.equal(result.responseText, 'Resposta final do CEO testada com sucesso.');
  } finally {
    try { fs.rmSync(tempBrainDir, { recursive: true, force: true }); } catch {}
  }
});
