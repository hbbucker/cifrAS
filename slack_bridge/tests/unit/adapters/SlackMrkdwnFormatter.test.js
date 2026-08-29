const test = require('node:test');
const assert = require('node:assert/strict');
const { SlackMrkdwnFormatter, SLACK_MARKDOWN_LIMIT } = require('../../../src/adapters/formatters/SlackMrkdwnFormatter');

test('SlackMrkdwnFormatter: createAccessibleFallback strips markdown syntax', () => {
  const formatter = new SlackMrkdwnFormatter();
  const raw = '# Título\n**Negrito** e [Link](https://example.com) com `código` e ```bloco```';
  const fallback = formatter.createAccessibleFallback(raw);

  assert.ok(!fallback.includes('#'));
  assert.ok(!fallback.includes('**'));
  assert.ok(!fallback.includes('`'));
  assert.ok(fallback.includes('Link (https://example.com)'));
});

test('SlackMrkdwnFormatter: splitMarkdownForSlack splits large blocks cleanly', () => {
  const formatter = new SlackMrkdwnFormatter();
  
  const shortText = 'Parágrafo 1\n\nParágrafo 2';
  const chunks = formatter.splitMarkdownForSlack(shortText);
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0], shortText);

  // Bloco gigante com quebra de palavras
  const hugeWord = 'A'.repeat(SLACK_MARKDOWN_LIMIT + 100);
  const hugeChunks = formatter.splitMarkdownForSlack(hugeWord);
  assert.ok(hugeChunks.length >= 2);

  // Bloco de código gigante que excede o limite (agora é dividido em chunks)
  const hugeCodeBlock = '```bash\n' + 'echo test;\n'.repeat(1000) + '```';
  const hugeCodeChunks = formatter.splitMarkdownForSlack(hugeCodeBlock);
  assert.ok(hugeCodeChunks.length >= 2);
});
