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

test('SlackMrkdwnFormatter: extractLocalFiles strips line anchors (#L...) and queries (?...)', () => {
  const formatter = new SlackMrkdwnFormatter();
  const text = 'Ver código em [server.js](file:///home/bucker/project/src/server.js#L10-L35) e [config.json](file:///home/bucker/project/config.json?v=2).';
  const result = formatter.extractLocalFiles(text);

  assert.deepEqual(result.filePaths, [
    '/home/bucker/project/src/server.js',
    '/home/bucker/project/config.json',
  ]);
  assert.equal(result.markdown, 'Ver código em *server.js* e *config.json*.');
});

test('SlackMrkdwnFormatter: extractLocalFiles resolves relative paths against workspaceDir', () => {
  const formatter = new SlackMrkdwnFormatter();
  const text = 'Confira a especificação em [spec.md](.specs/features/xyz/spec.md) e [README](./README.md).';
  const workspaceDir = '/home/bucker/app';
  const result = formatter.extractLocalFiles(text, { workspaceDir });

  assert.deepEqual(result.filePaths, [
    '/home/bucker/app/.specs/features/xyz/spec.md',
    '/home/bucker/app/README.md',
  ]);
  assert.equal(result.markdown, 'Confira a especificação em *spec.md* e *README*.');
});

test('SlackMrkdwnFormatter: extractLocalFiles preserves web links for standard Slack formatting', () => {
  const formatter = new SlackMrkdwnFormatter();
  const text = 'Veja a doc em [Google](https://google.com) e o arquivo [local](file:///tmp/output.txt).';
  const result = formatter.extractLocalFiles(text);

  assert.deepEqual(result.filePaths, ['/tmp/output.txt']);
  assert.equal(result.markdown, 'Veja a doc em [Google](https://google.com) e o arquivo *local*.');
});

test('SlackMrkdwnFormatter: extractLocalFiles extracts images and decorates markdown', () => {
  const formatter = new SlackMrkdwnFormatter();
  const text = 'Diagrama de arquitetura: ![Arquitetura](file:///tmp/diagram.png)';
  const result = formatter.extractLocalFiles(text);

  assert.deepEqual(result.filePaths, ['/tmp/diagram.png']);
  assert.equal(result.markdown, 'Diagrama de arquitetura: *🖼️ Arquitetura*');
});

