const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const net = require('node:net');
const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');
const { EngineEvent } = require('../../../domain/events/EngineEvent');
const { EngineQuotaExhaustedError } = require('../../../domain/errors/EngineQuotaExhaustedError');
const { EnginePipelineError } = require('../../../domain/errors/EnginePipelineError');
const { EngineProcessRunner } = require('../shared/EngineProcessRunner');

const DEFAULT_BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');
const TRANSCRIPT_RELATIVE_PATH = path.join('.system_generated', 'logs', 'transcript.jsonl');
const QUOTA_SIGNATURE = 'Individual quota reached';
const QUOTA_BUFFER_BYTE_LIMIT = 4096;
const MAX_STEP_BYTES = 4 * 1024 * 1024;
const MAX_ACTIVE_STEPS = 128;

function truncateQuotaBuffer(bufferText) {
  const combinedBuffer = Buffer.from(bufferText, 'utf8');
  return combinedBuffer.subarray(Math.max(0, combinedBuffer.length - QUOTA_BUFFER_BYTE_LIMIT)).toString('utf8');
}

function parseRetryAfterSeconds(quotaBuffer, allowEndOfInput = true) {
  const terminator = allowEndOfInput ? '(?=[.\\s]|$)' : '(?=[.\\s])';
  const resetPattern = new RegExp(`Resets in\\s+([^\\s.]+)${terminator}`, 'g');
  for (const match of quotaBuffer.matchAll(resetPattern)) {
    const durationMatch = match[1].match(/^(?:(\d{1,3})h)?(?:(\d{1,2})m)?(?:(\d{1,2})s)?$/);
    if (!durationMatch || !durationMatch[0]) continue;
    const hours = durationMatch[1] === undefined ? 0 : Number(durationMatch[1]);
    const minutes = durationMatch[2] === undefined ? 0 : Number(durationMatch[2]);
    const seconds = durationMatch[3] === undefined ? 0 : Number(durationMatch[3]);
    if (minutes > 59 || seconds > 59) continue;
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds > 0) return totalSeconds;
  }
  return null;
}

function isProxyRunning(port = 8787) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(200);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => resolve(false));
    socket.connect(port, '127.0.0.1');
  });
}

class AntigravityEngineAdapter extends ILLMEnginePort {
  constructor({ brainDir = DEFAULT_BRAIN_DIR, agyBin = 'agy', spawnFn = spawn,
    inactivityTimeoutMs = 300_000, maxTurnTimeoutMs = 7_200_000,
    turnTimeoutMs, runnerOptions = {} } = {}) {
    super();
    this.brainDir = path.resolve(brainDir);
    this.agyBin = agyBin;
    this.inactivityTimeoutMs = Number(process.env.LLM_INACTIVITY_TIMEOUT_MS)
      || (turnTimeoutMs !== undefined ? turnTimeoutMs : inactivityTimeoutMs);
    this.maxTurnTimeoutMs = Number(process.env.LLM_MAX_TURN_TIMEOUT_MS) || maxTurnTimeoutMs;
    this.runner = new EngineProcessRunner({ spawnFn, inactivityTimeoutMs: this.inactivityTimeoutMs,
      maxTurnTimeoutMs: this.maxTurnTimeoutMs, ...runnerOptions });
  }

  async *executeStream(instruction) {
    const executionContext = {
      boundSessionId: instruction.sessionId || null, quotaBuffer: '', quotaDetected: false,
      quotaSignatureOverlap: '', retryAfterSeconds: null, stepBuffers: new Map(),
      transcriptCursor: await this.captureTranscriptCursor(instruction.sessionId),
    };
    const env = { ...process.env };
    if (await isProxyRunning(8787)) env.CLOUD_CODE_URL = 'http://localhost:8787';
    yield* this.runner.execute({
      engine: 'antigravity', command: this.agyBin, args: this.buildCliArgs(instruction),
      cwd: instruction.workspaceDir, env, executionContext,
      translateRecord: (record, context) => this.translateRecord(record, context),
      classifyStderr: (chunk, context) => this.classifyStderr(chunk, context),
      getPriorityFailure: (context) => this.getQuotaFailure(context),
      resolveFilePaths: (context) => this.readTranscriptFilesSinceCursor(context),
    });
  }

  buildCliArgs({ prompt, sessionId, workspaceDir }) {
    const args = ['-p', prompt, '--add-dir', workspaceDir];
    if (typeof sessionId === 'string' && sessionId.trim()) args.push('--conversation', sessionId.trim());
    args.push('--print-timeout', '1h', '--dangerously-skip-permissions', '--sandbox', '--output-format', 'stream-json');
    return args;
  }

  async translateRecord(record, executionContext) {
    const events = [];
    if (record.event === 'init') {
      if (record.conversation_id) {
        executionContext.boundSessionId = record.conversation_id;
        if (!executionContext.transcriptCursor) {
          executionContext.transcriptCursor = await this.captureTranscriptCursor(record.conversation_id);
        }
        events.push(EngineEvent.sessionBound(record.conversation_id));
      }
      return { events, terminal: null };
    }
    if (record.event === 'result') {
      const result = record.result;
      if (result?.conversation_id && !executionContext.boundSessionId) {
        executionContext.boundSessionId = result.conversation_id;
        events.push(EngineEvent.sessionBound(result.conversation_id));
      }
      const success = result && String(result.status || '').toUpperCase() === 'SUCCESS';
      const responseText = typeof result?.response === 'string' ? result.response.trim() : '';
      return { events, terminal: success && responseText
        ? { kind: 'success', responseText, error: null, protocolType: 'result' }
        : { kind: 'failure', responseText: '',
          error: new EnginePipelineError(success ? 'ENGINE_PROTOCOL_MISSING_RESPONSE' : 'ENGINE_PROTOCOL_FAILURE'),
          protocolType: 'result' } };
    }
    if (record.event !== 'step_update' || !record.step_update) return null;
    const update = record.step_update;
    const subagents = update.subagent_info?.subagents;
    if (Array.isArray(subagents)) {
      for (const subagent of subagents) {
        if (subagent.conversation_id) {
          events.push(EngineEvent.subagentDiscovered(subagent.conversation_id,
            subagent.role || subagent.type_name || null, {}));
        }
      }
    }
    if (update.step_type === 'agent_response') {
      const conversationId = update.conversation_id || executionContext.boundSessionId;
      const stepIndex = update.step_index ?? 0;
      const bufferKey = `${conversationId}:${stepIndex}`;
      const textChunk = typeof update.text_delta === 'string'
        ? update.text_delta : (typeof update.text === 'string' ? update.text : '');
      if (!executionContext.stepBuffers.has(bufferKey)
        && executionContext.stepBuffers.size >= MAX_ACTIVE_STEPS) {
        throw new EnginePipelineError('ENGINE_PROTOCOL_STATE_LIMIT');
      }
      const currentText = `${executionContext.stepBuffers.get(bufferKey) || ''}${textChunk}`;
      if (Buffer.byteLength(currentText, 'utf8') > MAX_STEP_BYTES) {
        throw new EnginePipelineError('ENGINE_PROTOCOL_STATE_LIMIT');
      }
      executionContext.stepBuffers.set(bufferKey, currentText);
      if (textChunk && conversationId) events.push(EngineEvent.textDeltaEmitted(conversationId, textChunk));
      if (update.state === 'DONE') {
        const milestoneText = currentText.trim();
        if (milestoneText && conversationId) {
          events.push(EngineEvent.milestoneCompleted(conversationId, null, milestoneText,
            { stepIndex, durationSeconds: update.duration_seconds }));
        }
        executionContext.stepBuffers.delete(bufferKey);
      }
    }
    if (update.step_type === 'tool' && update.state === 'ACTIVE') {
      events.push(EngineEvent.statusUpdated(update.conversation_id || executionContext.boundSessionId,
        `Tool: ${update.tool_name || ''}`));
    }
    if (update.status_text) {
      events.push(EngineEvent.statusUpdated(update.conversation_id || executionContext.boundSessionId,
        update.status_text));
    }
    return { events, terminal: null };
  }

  classifyStderr(chunk, executionContext) {
    const chunkText = Buffer.from(chunk).toString('utf8');
    const signatureSearchText = executionContext.quotaSignatureOverlap + chunkText;
    if (signatureSearchText.includes(QUOTA_SIGNATURE)) executionContext.quotaDetected = true;
    executionContext.quotaSignatureOverlap = executionContext.quotaDetected
      ? '' : signatureSearchText.slice(-(QUOTA_SIGNATURE.length - 1));
    if (executionContext.quotaDetected && executionContext.retryAfterSeconds === null) {
      const durationSearchText = executionContext.quotaBuffer + chunkText;
      executionContext.retryAfterSeconds = parseRetryAfterSeconds(durationSearchText, false);
      executionContext.quotaBuffer = executionContext.retryAfterSeconds === null
        ? truncateQuotaBuffer(durationSearchText) : '';
    }
  }

  getQuotaFailure(executionContext) {
    if (!executionContext.quotaDetected) return null;
    const retryAfterSeconds = executionContext.retryAfterSeconds
      || parseRetryAfterSeconds(executionContext.quotaBuffer);
    return { kind: 'failure', responseText: '',
      error: new EngineQuotaExhaustedError(retryAfterSeconds), protocolType: 'quota' };
  }

  getTranscriptPath(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId.trim()) return null;
    const transcriptPath = path.resolve(this.brainDir, sessionId.trim(), TRANSCRIPT_RELATIVE_PATH);
    return transcriptPath.startsWith(`${this.brainDir}${path.sep}`) ? transcriptPath : null;
  }

  async captureTranscriptCursor(sessionId) {
    const transcriptPath = this.getTranscriptPath(sessionId);
    if (!transcriptPath) return null;
    try {
      const stat = await fs.stat(transcriptPath);
      if (!stat.isFile()) return null;
      return { resolvedPath: transcriptPath, device: stat.dev, inode: stat.ino, byteOffset: stat.size };
    } catch { return null; }
  }

  async readTranscriptFilesSinceCursor(executionContext) {
    const cursor = executionContext.transcriptCursor;
    const expectedPath = this.getTranscriptPath(executionContext.boundSessionId);
    if (!cursor || !expectedPath || cursor.resolvedPath !== expectedPath) return [];
    try {
      const stat = await fs.stat(expectedPath);
      if (!stat.isFile() || stat.dev !== cursor.device || stat.ino !== cursor.inode || stat.size < cursor.byteOffset) return [];
      const fileHandle = await fs.open(expectedPath, 'r');
      let content;
      try {
        const byteCount = stat.size - cursor.byteOffset;
        const buffer = Buffer.alloc(byteCount);
        await fileHandle.read(buffer, 0, byteCount, cursor.byteOffset);
        content = buffer.toString('utf8');
      } finally { await fileHandle.close(); }
      const candidates = new Set();
      for (const line of content.split('\n')) {
        if (!line.trim()) continue;
        let record;
        try { record = JSON.parse(line); } catch { continue; }
        if (!Array.isArray(record.tool_calls)) continue;
        for (const toolCall of record.tool_calls) {
          const toolArguments = toolCall.args || toolCall;
          if (typeof toolArguments.TargetFile === 'string') candidates.add(toolArguments.TargetFile);
          if (Array.isArray(toolArguments.ImagePaths)) {
            for (const imagePath of toolArguments.ImagePaths) {
              if (typeof imagePath === 'string') candidates.add(imagePath);
            }
          }
        }
      }
      const filePaths = [];
      for (const candidate of candidates) {
        try { if ((await fs.stat(candidate)).isFile()) filePaths.push(candidate); } catch {}
      }
      return filePaths;
    } catch { return []; }
  }
}

module.exports = { AntigravityEngineAdapter, DEFAULT_BRAIN_DIR, TRANSCRIPT_RELATIVE_PATH,
  parseRetryAfterSeconds, MAX_STEP_BYTES, MAX_ACTIVE_STEPS };
