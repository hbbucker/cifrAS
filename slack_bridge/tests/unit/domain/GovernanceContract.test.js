const test = require('node:test');
const assert = require('node:assert/strict');
const { GovernanceContract } = require('../../../src/domain/value-objects/GovernanceContract');

test('GovernanceContract: builds formatted prompt with unique ID and contracts', () => {
  const contract = new GovernanceContract();
  const prompt = contract.formatPrompt('Implementar feature de busca', 'init_uuid_123');

  assert.ok(prompt.includes('Implementar feature de busca'));
  assert.ok(prompt.includes('init_uuid_123'));
  assert.ok(prompt.includes('Produza relatos humanos úteis'));
  assert.ok(prompt.includes('Não agende timers de espera (schedule)'));
});
