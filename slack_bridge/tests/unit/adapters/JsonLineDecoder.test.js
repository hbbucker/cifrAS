const test = require('node:test');
const assert = require('node:assert/strict');
const { JsonLineDecoder } = require('../../../src/adapters/engines/shared/JsonLineDecoder');

function decodeChunks(chunks, options = {}) {
  const records = [];
  const diagnostics = [];
  const decoder = new JsonLineDecoder({
    ...options,
    onRecord: (record) => records.push(record),
    onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
  });
  for (const chunk of chunks) decoder.write(chunk);
  const failure = decoder.end();
  return { records, diagnostics, failure };
}

test('JsonLineDecoder preserves UTF-8 at every byte boundary', () => {
  for (const text of ['ação', '🚀', '漢字']) {
    const line = Buffer.from(JSON.stringify({ event: 'text', text }) + '\n');
    for (let split = 1; split < line.length; split += 1) {
      const result = decodeChunks([line.subarray(0, split), line.subarray(split)]);
      assert.equal(result.records[0].text, text, `${text} split at ${split}`);
      assert.doesNotMatch(result.records[0].text, /�/);
    }
  }
});

test('JsonLineDecoder supports fragmented JSON, LF, CRLF, empty and final lines', () => {
  const result = decodeChunks([
    Buffer.from('{"event":"one"'),
    Buffer.from('}\r\n\n{"event":"two"}\n{"event":"three"}'),
  ]);
  assert.deepEqual(result.records.map((record) => record.event), ['one', 'two', 'three']);
  assert.equal(result.failure, null);
});

test('JsonLineDecoder skips malformed and primitive records without losing order', () => {
  const secret = 'secret-payload-value';
  const result = decodeChunks([Buffer.from([
    '{"event":"before"}',
    `{${secret}`,
    '42',
    '{"event":"after"}',
  ].join('\n'))]);
  assert.deepEqual(result.records.map((record) => record.event), ['before', 'after']);
  assert.deepEqual(result.diagnostics.map((item) => item.code), [
    'ENGINE_STREAM_MALFORMED_LINE',
    'ENGINE_STREAM_INVALID_RECORD',
  ]);
  assert.doesNotMatch(JSON.stringify(result.diagnostics), new RegExp(secret));
});

test('JsonLineDecoder accepts exact limit and rejects one byte above it once', () => {
  const maxLineBytes = 1024 * 1024;
  const exactPayload = JSON.stringify({ value: 'x'.repeat(maxLineBytes - 12) });
  assert.equal(Buffer.byteLength(exactPayload), maxLineBytes);
  const exact = decodeChunks([Buffer.from(exactPayload)], { maxLineBytes });
  assert.equal(exact.records.length, 1);

  const diagnostics = [];
  const decoder = new JsonLineDecoder({
    maxLineBytes,
    onRecord: () => assert.fail('oversized record must not be emitted'),
    onDiagnostic: (diagnostic) => diagnostics.push(diagnostic),
  });
  decoder.write(Buffer.from(`${exactPayload}x`));
  decoder.write(Buffer.from('{"event":"late"}\n'));
  const firstFailure = decoder.end();
  const secondFailure = decoder.end();
  assert.equal(firstFailure.code, 'ENGINE_STREAM_LINE_LIMIT');
  assert.equal(secondFailure.code, 'ENGINE_STREAM_LINE_LIMIT');
  assert.equal(diagnostics.length, 1);
  assert.doesNotMatch(JSON.stringify([diagnostics, firstFailure]), /x{20}/);
});
