const test = require('node:test');
const assert = require('node:assert/strict');
const { SlackMrkdwnFormatter } = require('../../../src/adapters/formatters/SlackMrkdwnFormatter');

test('SlackMrkdwnFormatter: converts markdown headers, bold and links to Slack mrkdwn', () => {
  const formatter = new SlackMrkdwnFormatter();

  // Cabeçalhos
  assert.equal(formatter.format('# Título Principal'), '*Título Principal*');
  assert.equal(formatter.format('### Subtítulo'), '*Subtítulo*');

  // Negrito GFM (** -> *)
  assert.equal(formatter.format('Este é um texto **importante** aqui.'), 'Este é um texto *importante* aqui.');

  // Links ([label](url) -> <url|label>)
  assert.equal(formatter.format('Veja o [Pull Request](https://github.com/pr/1)'), 'Veja o <https://github.com/pr/1|Pull Request>');
});

test('SlackMrkdwnFormatter: extracts local file links and redacts local paths', () => {
  const formatter = new SlackMrkdwnFormatter();
  const text = 'Relatório gerado em [report.md](file:///home/bucker/project/report.md) com sucesso.';
  
  const extracted = formatter.extractLocalFiles(text);
  assert.deepEqual(extracted.filePaths, ['/home/bucker/project/report.md']);
  assert.ok(!extracted.markdown.includes('/home/bucker'));
});
