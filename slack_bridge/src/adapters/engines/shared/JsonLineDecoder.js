const { StringDecoder } = require('node:string_decoder');
const { EnginePipelineError } = require('../../../domain/errors/EnginePipelineError');

const DEFAULT_MAX_LINE_BYTES = 1024 * 1024;

class JsonLineDecoder {
  constructor({ maxLineBytes = DEFAULT_MAX_LINE_BYTES, onRecord, onDiagnostic = () => {} } = {}) {
    this.maxLineBytes = maxLineBytes;
    this.onRecord = onRecord;
    this.onDiagnostic = onDiagnostic;
    this.stringDecoder = new StringDecoder('utf8');
    this.pendingText = '';
    this.pendingBytes = 0;
    this.closed = false;
    this.failure = null;
  }

  write(chunk) {
    if (this.closed || this.failure) return;
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    const decodedText = this.stringDecoder.write(buffer);
    this.consumeDecodedText(decodedText);
  }

  end() {
    if (this.closed || this.failure) return this.failure;
    this.consumeDecodedText(this.stringDecoder.end());
    if (!this.failure && this.pendingText.length > 0) this.consumeLine(this.pendingText);
    this.pendingText = '';
    this.pendingBytes = 0;
    this.closed = true;
    return this.failure;
  }

  consumeDecodedText(decodedText) {
    if (!decodedText || this.failure) return;
    const combinedText = this.pendingText + decodedText;
    const lines = combinedText.split('\n');
    this.pendingText = lines.pop() || '';
    for (const line of lines) {
      if (this.failure) return;
      this.assertLineLimit(line, true);
      if (!this.failure) this.consumeLine(line.endsWith('\r') ? line.slice(0, -1) : line);
    }
    if (!this.failure) {
      this.pendingBytes = Buffer.byteLength(this.pendingText, 'utf8');
      if (this.pendingBytes > this.maxLineBytes) this.failLineLimit(this.pendingBytes);
    }
  }

  assertLineLimit(line, includesNewline) {
    const byteCount = Buffer.byteLength(line, 'utf8');
    if (byteCount > this.maxLineBytes) this.failLineLimit(byteCount, includesNewline);
  }

  failLineLimit(byteCount) {
    this.pendingText = '';
    this.pendingBytes = 0;
    this.failure = new EnginePipelineError('ENGINE_STREAM_LINE_LIMIT');
    this.onDiagnostic({ code: this.failure.code, count: 1, byteCount });
  }

  consumeLine(line) {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    try {
      const record = JSON.parse(trimmedLine);
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        this.onDiagnostic({ code: 'ENGINE_STREAM_INVALID_RECORD', count: 1, byteCount: Buffer.byteLength(line) });
        return;
      }
      this.onRecord(record);
    } catch {
      this.onDiagnostic({ code: 'ENGINE_STREAM_MALFORMED_LINE', count: 1, byteCount: Buffer.byteLength(line) });
    }
  }
}

module.exports = { JsonLineDecoder, DEFAULT_MAX_LINE_BYTES };
