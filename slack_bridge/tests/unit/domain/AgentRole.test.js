const test = require('node:test');
const assert = require('node:assert/strict');
const { AgentRole } = require('../../../src/domain/value-objects/AgentRole');

test('AgentRole: identifies canonical roles and returns formatted icon strings', () => {
  const ceo = AgentRole.from('CEO');
  assert.equal(ceo.name, 'CEO');
  assert.equal(ceo.formattedName, '👔 CEO');
  assert.equal(ceo.isCanonical, true);
  assert.equal(ceo.isMaker, false);
  assert.equal(ceo.isChecker, false);

  const cto = AgentRole.from('CTO');
  assert.equal(cto.name, 'CTO');
  assert.equal(cto.formattedName, '🛠️ CTO');
  assert.equal(cto.isCanonical, true);
  assert.equal(cto.isMaker, true);

  const cpo = AgentRole.from('CPO');
  assert.equal(cpo.formattedName, '🎯 CPO');
  assert.equal(cpo.isCanonical, true);

  const qa = AgentRole.from('QA Lead');
  assert.equal(qa.formattedName, '🛡️ QA Lead');
  assert.equal(qa.isCanonical, true);
  assert.equal(qa.isChecker, true);
  assert.equal(qa.isMaker, false);

  const frontend = AgentRole.from('Frontend Staff');
  assert.equal(frontend.formattedName, '🎨 Frontend Staff');
  assert.equal(frontend.isCanonical, true);
  assert.equal(frontend.isMaker, true);

  const backend = AgentRole.from('Backend Staff');
  assert.equal(backend.formattedName, '⚙️ Backend Staff');

  const custom = AgentRole.from('Database Optimizer');
  assert.equal(custom.formattedName, '🤖 Database Optimizer');
  assert.equal(custom.isCanonical, false);

  const empty = AgentRole.from('');
  assert.equal(empty.formattedName, '🤖 Sistema');
});

test('AgentRole: provides progress stage messages for canonical roles', () => {
  const cto = AgentRole.from('CTO');
  assert.equal(cto.getProgressMessage('delegated'), 'CEO enviou ao CTO a avaliação de viabilidade técnica.');
  assert.equal(cto.getProgressMessage('started'), 'CTO está avaliando a viabilidade técnica.');
  assert.equal(cto.getProgressMessage('completed'), 'CTO concluiu a avaliação técnica.');

  const custom = AgentRole.from('Custom Agent');
  assert.equal(custom.getProgressMessage('delegated'), null);
});
