const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');
const { EngineEvent } = require('../../../domain/events/EngineEvent');
const { TurnResultDTO } = require('../../../domain/dtos/TurnResultDTO');
const { EngineQuotaExhaustedError } = require('../../../domain/errors/EngineQuotaExhaustedError');
const { AntigravityStreamParser } = require('./AntigravityStreamParser');

const net = require('node:net');

const DEFAULT_BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');
const TRANSCRIPT_RELATIVE_PATH = path.join('.system_generated', 'logs', 'transcript.jsonl');
const QUOTA_SIGNATURE = 'Individual quota reached';
const QUOTA_BUFFER_BYTE_LIMIT = 4096;

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

/**
 * Helper para checar se o proxy de tokens (RTK/Headroom) está rodando na porta local.
 */
function isProxyRunning(port = 8787) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(200);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

/**
 * Fila assíncrona pura para transformar fluxos push de eventos em AsyncIterable (Pull/Push).
 */
class AsyncEventQueue {
  constructor() {
    this._queue = [];
    this._resolvers = [];
    this._closed = false;
    this._error = null;
  }

  push(item) {
    if (this._closed) return;
    if (this._resolvers.length > 0) {
      const resolve = this._resolvers.shift();
      resolve({ value: item, done: false });
    } else {
      this._queue.push(item);
    }
  }

  close() {
    if (this._closed) return;
    this._closed = true;
    while (this._resolvers.length > 0) {
      const resolve = this._resolvers.shift();
      resolve({ value: undefined, done: true });
    }
  }

  fail(err) {
    if (this._closed) return;
    this._error = err;
    this._closed = true;
    while (this._resolvers.length > 0) {
      const resolve = this._resolvers.shift();
      resolve({ value: undefined, done: true });
    }
  }

  async *[Symbol.asyncIterator]() {
    while (true) {
      if (this._queue.length > 0) {
        yield this._queue.shift();
      } else if (this._closed) {
        if (this._error) throw this._error;
        return;
      } else {
        const nextItem = await new Promise((resolve) => this._resolvers.push(resolve));
        if (nextItem.done) {
          if (this._error) throw this._error;
          return;
        }
        yield nextItem.value;
      }
    }
  }
}

class AntigravityEngineAdapter extends ILLMEnginePort {
  constructor({
    brainDir = DEFAULT_BRAIN_DIR,
    agyBin = 'agy',
    spawnFn = spawn,
    inactivityTimeoutMs = 300_000,
    maxTurnTimeoutMs = 7_200_000,
    turnTimeoutMs,
  } = {}) {
    super();
    this.brainDir = brainDir;
    this.agyBin = agyBin;
    this.spawn = spawnFn;
    this.inactivityTimeoutMs = Number(process.env.LLM_INACTIVITY_TIMEOUT_MS)
      || (turnTimeoutMs !== undefined ? turnTimeoutMs : inactivityTimeoutMs);
    this.maxTurnTimeoutMs = Number(process.env.LLM_MAX_TURN_TIMEOUT_MS) || maxTurnTimeoutMs;
  }

  /**
   * Executa uma instrução emitindo um fluxo tipado de eventos assíncronos (AsyncIterable<EngineEvent>).
   * @param {import('../../../domain/dtos/EngineInstructionDTO').EngineInstructionDTO} instruction
   * @returns {AsyncIterable<EngineEvent>}
   */
  async *executeStream(instruction) {
    const args = this.buildCliArgs(instruction);
    const executionContext = {
      boundSessionId: instruction.sessionId || null,
      quotaBuffer: '',
      quotaDetected: false,
      quotaSignatureOverlap: '',
      retryAfterSeconds: null,
    };
    const queue = new AsyncEventQueue();
    let terminalClaimed = false;

    const env = { ...process.env };
    const proxyIsActive = await isProxyRunning(8787);
    
    if (proxyIsActive) {
      env.CLOUD_CODE_URL = 'http://localhost:8787';
    }

    const child = this.spawn(this.agyBin, args, {
      cwd: instruction.workspaceDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
    });

    let inactivityTimer = null;
    let maxTurnTimer = null;

    const resetInactivityTimer = () => {
      if (terminalClaimed) return;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (this.inactivityTimeoutMs > 0) {
        inactivityTimer = setTimeout(() => {
          if (terminalClaimed) return;
          if (global.logDebug) global.logDebug(`[AGY] Turn inactivity timed out after ${this.inactivityTimeoutMs}ms of silence`);
          try {
            if (!child.killed) child.kill('SIGKILL');
          } catch {}
          finish(1, new Error(`Turn execution timed out after ${this.inactivityTimeoutMs}ms of inactivity`));
        }, this.inactivityTimeoutMs);
        if (inactivityTimer.unref) inactivityTimer.unref();
      }
    };

    resetInactivityTimer();

    if (this.maxTurnTimeoutMs > 0) {
      maxTurnTimer = setTimeout(() => {
        if (terminalClaimed) return;
        if (global.logDebug) global.logDebug(`[AGY] Max turn timeout reached after ${this.maxTurnTimeoutMs}ms`);
        try {
          if (!child.killed) child.kill('SIGKILL');
        } catch {}
        finish(1, new Error(`Max turn execution time exceeded ${this.maxTurnTimeoutMs}ms`));
      }, this.maxTurnTimeoutMs);
      if (maxTurnTimer.unref) maxTurnTimer.unref();
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        resetInactivityTimer();
        this.handleStderr(chunk);
        const chunkText = chunk.toString('utf8');
        const signatureSearchText = executionContext.quotaSignatureOverlap + chunkText;
        if (signatureSearchText.includes(QUOTA_SIGNATURE)) {
          executionContext.quotaDetected = true;
        }
        executionContext.quotaSignatureOverlap = executionContext.quotaDetected
          ? ''
          : signatureSearchText.slice(-(QUOTA_SIGNATURE.length - 1));

        if (executionContext.quotaDetected && executionContext.retryAfterSeconds === null) {
          const durationSearchText = executionContext.quotaBuffer + chunkText;
          executionContext.retryAfterSeconds = parseRetryAfterSeconds(durationSearchText, false);
          executionContext.quotaBuffer = executionContext.retryAfterSeconds === null
            ? truncateQuotaBuffer(durationSearchText)
            : '';
        }
      });
    }

    const streamParser = AntigravityStreamParser.create((event) => {
      resetInactivityTimer();
      if (executionContext.quotaDetected) return;
      if (global.logDebug) global.logDebug('[AGY] Stream Event:', event.event, event.step_update ? (event.step_update.step_type || event.step_update.state) : '');
      this.translateStreamEvent(event, queue, executionContext, () => {
        finish(0);
      });
    });

    child.stdout.on('data', (chunk) => {
      resetInactivityTimer();
      streamParser(chunk);
    });

    const finish = async (exitCode, error = null) => {
      if (terminalClaimed) return;
      terminalClaimed = true;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (maxTurnTimer) clearTimeout(maxTurnTimer);
      streamParser.flush();

      // Encerra graciosamente processos filhos residuais que prendam descritores
      try {
        if (!child.killed) {
          child.kill('SIGTERM');
          setTimeout(() => {
            try {
              if (!child.killed) child.kill('SIGKILL');
            } catch {}
          }, 2000).unref?.();
        }
      } catch {}

      if (executionContext.quotaDetected) {
        const retryAfterSeconds = executionContext.retryAfterSeconds
          || parseRetryAfterSeconds(executionContext.quotaBuffer);
        queue.push(EngineEvent.executionFailed(
          new EngineQuotaExhaustedError(retryAfterSeconds),
          exitCode
        ));
        executionContext.quotaBuffer = '';
        executionContext.quotaSignatureOverlap = '';
        queue.close();
        return;
      }

      const responseText = await this.readTranscriptResponse(executionContext.boundSessionId);
      const filePaths = await this.readTranscriptFiles(executionContext.boundSessionId);
      const normalizedExitCode = typeof exitCode === 'number' ? exitCode : 0;
      const isSuccess = (normalizedExitCode === 0 || Boolean(responseText)) && !error;

      if (isSuccess) {
        queue.push(EngineEvent.executionCompleted(new TurnResultDTO({
          exitCode: normalizedExitCode,
          responseText,
          filePaths,
          error: null,
        })));
      } else {
        queue.push(EngineEvent.executionFailed(
          error || new Error(`Process exited with code ${exitCode}`),
          exitCode
        ));
      }

      executionContext.quotaBuffer = '';
      queue.close();
    };

    child.once('close', (code) => finish(code));
    child.once('error', (err) => finish(1, err));

    yield* queue;
  }

  /**
   * Monta o array determinístico de argumentos para invocar o CLI `agy`.
   */
  buildCliArgs({ prompt, sessionId, workspaceDir }) {
    const args = ['-p', prompt, '--add-dir', workspaceDir];
    if (typeof sessionId === 'string' && sessionId.trim()) {
      args.push('--conversation', sessionId.trim());
    }
    args.push('--print-timeout', '1h', '--dangerously-skip-permissions', '--sandbox', '--output-format', 'stream-json');
    return args;
  }

  /**
   * Traduz eventos NDJSON do protocolo Antigravity e enfileira instâncias tipadas de EngineEvent.
   */
  translateStreamEvent(event, queue, executionContext = {}, onResult = null) {
    if (!event || !queue) return;

    // 1. Vincula Session ID da sessão raiz
    if (event.event === 'init' && event.conversation_id) {
      executionContext.boundSessionId = event.conversation_id;
      queue.push(EngineEvent.sessionBound(executionContext.boundSessionId));
    }

    // 2. Evento terminal 'result' emitido pelo AGY ao concluir o turno
    if (event.event === 'result') {
      if (typeof onResult === 'function') {
        onResult(event);
      }
      return;
    }

    // 2. Notificação de Subagente descoberto
    const subagents = event.event === 'step_update' && event.step_update && event.step_update.subagent_info && event.step_update.subagent_info.subagents;
    if (Array.isArray(subagents)) {
      for (const sub of subagents) {
        if (sub.conversation_id) {
          queue.push(EngineEvent.subagentDiscovered(
            sub.conversation_id,
            sub.role || sub.type_name || null,
            sub
          ));
        }
      }
    }

    // 3. Streaming de deltas de pensamento / texto e emissão de marcos por conversation_id
    if (event.event === 'step_update' && event.step_update && event.step_update.step_type === 'agent_response') {
      const convId = event.step_update.conversation_id || executionContext.boundSessionId;
      const stepIndex = event.step_update.step_index ?? 0;
      const bufferKey = `${convId}:${stepIndex}`;
      const textChunk = event.step_update.text_delta || event.step_update.text || '';

      if (!executionContext.stepBuffers) {
        executionContext.stepBuffers = new Map();
      }

      const currentBuffer = (executionContext.stepBuffers.get(bufferKey) || '') + textChunk;
      executionContext.stepBuffers.set(bufferKey, currentBuffer);

      if (textChunk && convId) {
        queue.push(EngineEvent.textDeltaEmitted(convId, textChunk));
      }

      // Quando o passo cognitivo é concluído (DONE), emite o marco completo
      if (event.step_update.state === 'DONE') {
        const fullStepText = currentBuffer.trim();
        if (fullStepText && convId) {
          queue.push(EngineEvent.milestoneCompleted(
            convId,
            null,
            fullStepText,
            { stepIndex, durationSeconds: event.step_update.duration_seconds }
          ));
        }
        executionContext.stepBuffers.delete(bufferKey);
      }
    }

    // 4. Mudança de status da execução
    if (event.event === 'step_update' && event.step_update && event.step_update.step_type === 'tool' && event.step_update.state === 'ACTIVE') {
      const convId = event.step_update.conversation_id || executionContext.boundSessionId;
      queue.push(EngineEvent.statusUpdated(convId, 'Tool: ' + event.step_update.tool_name));
    }
    
    if (event.event === 'step_update' && event.step_update && event.step_update.status_text) {
      const convId = event.step_update.conversation_id || executionContext.boundSessionId;
      queue.push(EngineEvent.statusUpdated(convId, event.step_update.status_text));
    }
  }

  /**
   * Lê assincronamente o transcript em disco e extrai o último PLANNER_RESPONSE.
   */
  async readTranscriptResponse(sessionId) {
    if (!sessionId) return '';

    const transcriptPath = path.join(this.brainDir, sessionId, TRANSCRIPT_RELATIVE_PATH);
    try {
      const content = await fs.readFile(transcriptPath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        const parsed = JSON.parse(lines[i]);
        if (parsed.type === 'PLANNER_RESPONSE' && parsed.content) {
          return parsed.content;
        }
      }
    } catch {
      // Retorna vazio caso o arquivo ainda não exista ou não tenha sido criado
    }
    return '';
  }

  /**
   * Lê assincronamente o transcript em disco e extrai caminhos de arquivos criados/modificados no turno.
   */
  async readTranscriptFiles(sessionId) {
    if (!sessionId) return [];

    const transcriptPath = path.join(this.brainDir, sessionId, TRANSCRIPT_RELATIVE_PATH);
    const filePaths = new Set();

    try {
      const content = await fs.readFile(transcriptPath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        const parsed = JSON.parse(lines[i]);
        if (Array.isArray(parsed.tool_calls)) {
          for (const call of parsed.tool_calls) {
            const args = call.args || call;
            if (args.TargetFile && typeof args.TargetFile === 'string') {
              filePaths.add(args.TargetFile);
            }
            if (Array.isArray(args.ImagePaths)) {
              for (const img of args.ImagePaths) {
                if (typeof img === 'string') filePaths.add(img);
              }
            }
          }
        }
      }
    } catch {
      // Retorna vazio caso o arquivo ainda não exista ou não tenha sido criado
    }

    const validFilePaths = [];
    for (const fp of filePaths) {
      try {
        const stat = await fs.stat(fp);
        if (stat.isFile()) validFilePaths.push(fp);
      } catch {}
    }

    return validFilePaths;
  }

  /**
   * Trata chunks do stderr para fins de debug quando ativado.
   */
  handleStderr(chunk) {
    if (process.env.SLACK_BRIDGE_DEBUG === '1') {
      process.stderr.write(`[agy stderr] ${chunk}`);
    }
  }
}

module.exports = {
  AntigravityEngineAdapter,
  AsyncEventQueue,
  DEFAULT_BRAIN_DIR,
  TRANSCRIPT_RELATIVE_PATH,
  parseRetryAfterSeconds,
};
