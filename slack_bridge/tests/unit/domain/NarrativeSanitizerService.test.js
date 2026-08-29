const test = require('node:test');
const assert = require('node:assert/strict');
const { NarrativeSanitizerService } = require('../../../src/domain/services/NarrativeSanitizerService');

test('NarrativeSanitizerService: sanitizes secrets and raw commands', () => {
  const sanitizer = new NarrativeSanitizerService();

  // Bloqueio de segredos
  assert.equal(sanitizer.sanitize('Minha key é xoxb-123456789-abcdef'), null);
  assert.equal(sanitizer.sanitize('Token sk-proj-1234567890abcdef'), null);
  assert.equal(sanitizer.sanitize('Authorization: Bearer my-secret-token'), null);

  // Bloqueio de dump de bash bruto curto
  assert.equal(sanitizer.sanitize('```bash\nnpm run build\n```'), null);
  assert.equal(sanitizer.sanitize('git status --short'), null);

  // Permite relatos narrativos humanos legítimos
  const humanText = 'Andamento: analisei o código e preparei o plano de migração.';
  assert.equal(sanitizer.sanitize(humanText), humanText);

  // Permite textos longos passarem inteiros (a divisão é responsabilidade do Formatter)
  const longText = 'A'.repeat(3500);
  const sanitizedLong = sanitizer.sanitize(longText);
  assert.equal(sanitizedLong.length, 3500);
});

test('NarrativeSanitizerService: handles anti-echo duplicates', () => {
  const sanitizer = new NarrativeSanitizerService();
  const publishedNarratives = ['CEO:Relato sobre a tarefa'];

  assert.equal(sanitizer.isDuplicate('CEO', 'Relato sobre a tarefa', publishedNarratives), true);
  assert.equal(sanitizer.isDuplicate('CEO', 'Outro relato', publishedNarratives), false);
  assert.equal(sanitizer.isDuplicate('CTO', 'Relato sobre a tarefa', publishedNarratives), false);
});
