const test = require('node:test');
const assert = require('node:assert/strict');
const { EngineInstructionDTO } = require('../../../src/domain/dtos/EngineInstructionDTO');

test('EngineInstructionDTO: validates required prompt and workspaceDir', () => {
  const instruction = new EngineInstructionDTO({
    prompt: '  Executar tarefa  ',
    sessionId: 'sess-123',
    workspaceDir: '/path/project',
  });

  assert.equal(instruction.prompt, 'Executar tarefa');
  assert.equal(instruction.sessionId, 'sess-123');
  assert.equal(instruction.workspaceDir, '/path/project');
  assert.equal(instruction.timeoutMs, 3_600_000);

  // Erros de validação
  assert.throws(() => new EngineInstructionDTO({ prompt: '', workspaceDir: '/path' }), /non-empty string/);
  assert.throws(() => new EngineInstructionDTO({ prompt: 'ola', workspaceDir: null }), /valid string path/);
});
