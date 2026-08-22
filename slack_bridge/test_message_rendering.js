const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  SLACK_MARKDOWN_LIMIT,
  createAccessibleFallback,
  createPublicationState,
  extractLocalFiles,
  postFinalMessage,
  publishFinalWithUploads,
  publishStatus,
  redactLocalPaths,
  splitMarkdownForSlack,
  waitForSlackQueue,
} = require('./bot');

function closeUploadStream(stream) {
  return new Promise((resolve, reject) => {
    stream.once('error', reject);
    stream.once('open', () => stream.destroy());
    stream.once('close', resolve);
  });
}

test('preserves Markdown structures and splits only at semantic boundaries', () => {
  const markdown = '# Title\n\n- First item\n- Second item\n\n[Slack](https://slack.com)\n\n```js\nconsole.log("ok");\n```';
  assert.deepEqual(splitMarkdownForSlack(markdown), [markdown]);

  const longMarkdown = `${'Paragraph. '.repeat(1300)}\n\n- A complete list item\n- Another complete list item`;
  const chunks = splitMarkdownForSlack(longMarkdown);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= SLACK_MARKDOWN_LIMIT));
  assert.equal(chunks.join('\n\n').includes('- A complete list item\n- Another complete list item'), true);
});

test('does not fragment a code block that exceeds the Slack Markdown limit', () => {
  assert.throws(
    () => splitMarkdownForSlack(`\`\`\`\n${'x'.repeat(SLACK_MARKDOWN_LIMIT)}\n\`\`\``),
    /code block exceeds/,
  );
});

test('extracts local file links and removes local paths from public content', () => {
  const extracted = extractLocalFiles('See [report](file:///tmp/report.md) and ![chart](/tmp/chart.png) and file:///tmp/other.txt');
  assert.deepEqual(extracted.filePaths, ['/tmp/report.md', '/tmp/chart.png']);
  assert.doesNotMatch(extracted.markdown, /file:\/\//);
  assert.doesNotMatch(redactLocalPaths('Path /tmp/private.txt and /home/user/secret'), /\/tmp|\/home/);
});

test('uses one native Markdown message or one plain-text fallback, never both', async () => {
  const nativeCalls = [];
  await postFinalMessage({ chat: { postMessage: async (payload) => nativeCalls.push(payload) } }, 'C1', 'T1', '# Result\n\n- item');
  assert.equal(nativeCalls.length, 1);
  assert.deepEqual(nativeCalls[0].blocks, [{ type: 'markdown', text: '# Result\n\n- item' }]);
  assert.match(nativeCalls[0].text, /Result/);

  const fallbackCalls = [];
  await postFinalMessage({
    chat: {
      postMessage: async (payload) => {
        fallbackCalls.push(payload);
        if (fallbackCalls.length === 1) throw { data: { error: 'invalid_blocks' } };
      },
    },
  }, 'C1', 'T1', '# Result\n\n- item');
  assert.equal(fallbackCalls.length, 2);
  assert.equal('blocks' in fallbackCalls[1], false);
  assert.equal(createAccessibleFallback('# Result\n\n**Value**'), 'Result\n\nValue');
});

test('contract: serializes status, native final, and upload without exposing a local path', async () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'slack-bridge-contract-'));
  const filePath = path.join(temporaryDirectory, 'report.md');
  fs.writeFileSync(filePath, 'report');
  const calls = [];
  const client = {
    chat: { postMessage: async (payload) => calls.push({ type: 'post', payload }) },
    files: { uploadV2: async (payload) => { await closeUploadStream(payload.file); calls.push({ type: 'upload', payload }); } },
  };
  const publication = createPublicationState();
  publication.latestRootResponse = '# Resultado\n\n[relatório](file://' + filePath + ')';

  publishStatus(client, 'thread-contract', 'channel-contract', publication, 'Estou analisando o contexto.', true);
  publishFinalWithUploads(client, 'thread-contract', 'channel-contract', publication);
  publishFinalWithUploads(client, 'thread-contract', 'channel-contract', publication);
  await waitForSlackQueue('thread-contract');

  assert.deepEqual(calls.map((call) => call.type), ['post', 'post', 'upload']);
  assert.equal(calls[0].payload.blocks, undefined);
  assert.deepEqual(calls[1].payload.blocks, [{ type: 'markdown', text: '# Resultado' }]);
  assert.doesNotMatch(calls[1].payload.text, new RegExp(filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(calls[2].payload.filename, 'report.md');
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('contract: reports general publication and upload failures with one safe human message', async () => {
  const publicationFailureCalls = [];
  const publicationFailureClient = {
    chat: {
      postMessage: async (payload) => {
        if (payload.blocks) throw new Error('connection reset');
        publicationFailureCalls.push(payload);
      },
    },
    files: { uploadV2: async () => assert.fail('upload must not run when final publication fails') },
  };
  const failedPublication = createPublicationState();
  failedPublication.latestRootResponse = '# Privado\n\n/home/user/secret';
  publishFinalWithUploads(publicationFailureClient, 'thread-general-failure', 'channel', failedPublication);
  await waitForSlackQueue('thread-general-failure');
  assert.deepEqual(publicationFailureCalls, [{ channel: 'channel', thread_ts: 'thread-general-failure', text: 'Não consegui publicar a resposta agora. Tente novamente em instantes.' }]);

  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'slack-bridge-upload-'));
  const filePath = path.join(temporaryDirectory, 'report.md');
  fs.writeFileSync(filePath, 'report');
  const uploadFailureCalls = [];
  const uploadFailureClient = {
    chat: { postMessage: async (payload) => uploadFailureCalls.push(payload) },
    files: { uploadV2: async ({ file }) => { await closeUploadStream(file); throw new Error('upload unavailable'); } },
  };
  const failedUpload = createPublicationState();
  failedUpload.latestRootResponse = 'Concluído: [relatório](file://' + filePath + ')';
  publishFinalWithUploads(uploadFailureClient, 'thread-upload-failure', 'channel', failedUpload);
  await waitForSlackQueue('thread-upload-failure');
  assert.equal(uploadFailureCalls.length, 2);
  assert.deepEqual(uploadFailureCalls[1], { channel: 'channel', thread_ts: 'thread-upload-failure', text: 'Não consegui publicar a resposta agora. Tente novamente em instantes.' });
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});
