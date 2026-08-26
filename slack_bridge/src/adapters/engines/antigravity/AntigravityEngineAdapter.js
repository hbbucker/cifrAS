const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');
const { EngineEvent } = require('../../../domain/events/EngineEvent');
const { TurnResultDTO } = require('../../../domain/dtos/TurnResultDTO');
const { AntigravityStreamParser } = require('./AntigravityStreamParser');

const DEFAULT_BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');
const TRANSCRIPT_RELATIVE_PATH = path.join('.system_generated', 'logs', 'transcript.jsonl');

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
  constructor({ brainDir = DEFAULT_BRAIN_DIR, agyBin = 'agy', spawnFn = spawn } = {}) {
    super();
    this.brainDir = brainDir;
    this.agyBin = agyBin;
    this.spawn = spawnFn;
  }

  /**
   * Executa uma instrução emitindo um fluxo tipado de eventos assíncronos (AsyncIterable<EngineEvent>).
   * @param {import('../../../domain/dtos/EngineInstructionDTO').EngineInstructionDTO} instruction
   * @returns {AsyncIterable<EngineEvent>}
   */
  async *executeStream(instruction) {
    const args = this.buildCliArgs(instruction);
    const executionContext = { boundSessionId: instruction.sessionId || null };
    const queue = new AsyncEventQueue();

    const child = this.spawn(this.agyBin, args, {
      cwd: instruction.workspaceDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    if (child.stderr) {
      child.stderr.on('data', (chunk) => this.handleStderr(chunk));
    }

    const streamParser = AntigravityStreamParser.create((event) => {
      this.translateStreamEvent(event, queue, executionContext);
    });

    child.stdout.on('data', streamParser);

    const finish = async (exitCode, error = null) => {
      streamParser.flush();

      const responseText = await this.readTranscriptResponse(executionContext.boundSessionId);
      const isSuccess = (typeof exitCode === 'number' ? exitCode : 0) === 0 || Boolean(responseText);

      if (isSuccess) {
        queue.push(EngineEvent.executionCompleted(new TurnResultDTO({
          exitCode: typeof exitCode === 'number' ? exitCode : 0,
          responseText,
          filePaths: [],
          error,
        })));
      } else {
        queue.push(EngineEvent.executionFailed(
          error || new Error(`Process exited with code ${exitCode}`),
          exitCode
        ));
      }

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
    args.push('--print-timeout', '1h', '--dangerously-skip-permissions', '--output-format', 'stream-json');
    return args;
  }

  /**
   * Traduz eventos NDJSON do protocolo Antigravity e enfileira instâncias tipadas de EngineEvent.
   */
  translateStreamEvent(event, queue, executionContext = {}) {
    if (!event || !queue) return;

    // 1. Vincula Session ID da sessão raiz
    if (event.event === 'init' && event.conversation_id) {
      executionContext.boundSessionId = event.conversation_id;
      queue.push(EngineEvent.sessionBound(executionContext.boundSessionId));
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
};
