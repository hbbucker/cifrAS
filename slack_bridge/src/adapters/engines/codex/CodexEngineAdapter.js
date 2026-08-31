const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');
const { EngineEvent } = require('../../../domain/events/EngineEvent');
const { TurnResultDTO } = require('../../../domain/dtos/TurnResultDTO');
const { AntigravityStreamParser } = require('../antigravity/AntigravityStreamParser');

const net = require('node:net');

const DEFAULT_BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');
const TRANSCRIPT_RELATIVE_PATH = path.join('.system_generated', 'logs', 'transcript.jsonl');

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

class CodexEngineAdapter extends ILLMEnginePort {
  constructor({ brainDir = DEFAULT_BRAIN_DIR, cliBin = 'codex', spawnFn = spawn } = {}) {
    super();
    this.brainDir = brainDir;
    this.cliBin = cliBin;
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

    const env = { ...process.env };
    const proxyIsActive = await isProxyRunning(8787);
    
    if (proxyIsActive) {
      env.CLOUD_CODE_URL = 'http://localhost:8787';
    }

    const child = this.spawn(this.cliBin, args, {
      cwd: instruction.workspaceDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
    });

    if (child.stderr) {
      child.stderr.on('data', (chunk) => this.handleStderr(chunk));
    }

    const streamParser = AntigravityStreamParser.create((event) => {
      if (global.logDebug) global.logDebug('[CODEX] Stream Event:', event.event, event.step_update ? (event.step_update.step_type || event.step_update.state) : '');
      this.translateStreamEvent(event, queue, executionContext);
    });

    child.stdout.on('data', streamParser);

    const finish = async (exitCode, error = null) => {
      streamParser.flush();

      const responseText = await this.readTranscriptResponse(executionContext.boundSessionId, executionContext);
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

  buildCliArgs({ prompt, sessionId, workspaceDir }) {
    const args = ['exec'];
    if (typeof sessionId === 'string' && sessionId.trim()) {
      args.push('resume', sessionId.trim());
    }
    args.push(prompt, '--add-dir', workspaceDir, '--dangerously-bypass-approvals-and-sandbox', '--json');
    return args;
  }

  /**
   * Traduz eventos JSON do codex e enfileira instâncias tipadas de EngineEvent.
   */
  translateStreamEvent(event, queue, executionContext = {}) {
    if (!event || !queue) return;

    if (event.type === 'thread.started' && event.thread_id) {
      executionContext.boundSessionId = event.thread_id;
      queue.push(EngineEvent.sessionBound(executionContext.boundSessionId));
    }

    if (event.type === 'item.completed' && event.item && event.item.type === 'agent_message') {
      const convId = executionContext.boundSessionId;
      const text = event.item.text || '';
      executionContext.lastResponseText = text;

      if (text && convId) {
        queue.push(EngineEvent.milestoneCompleted(
          convId,
          null,
          text,
          {}
        ));
        // Simulate text delta since codex json doesn't stream it currently
        queue.push(EngineEvent.textDeltaEmitted(convId, text));
      }
    }

    if (event.type === 'item.started' && event.item) {
      const convId = executionContext.boundSessionId;
      if (event.item.type === 'command_execution') {
        queue.push(EngineEvent.statusUpdated(convId, 'Executando comando: ' + (event.item.command || '')));
      } else if (event.item.type === 'tool_use') {
        queue.push(EngineEvent.statusUpdated(convId, 'Usando ferramenta: ' + (event.item.tool_name || '')));
      }
    }
  }

  /**
   * Obtém a resposta final do contexto de execução, pois o codex não salva no brainDir do AGY.
   */
  async readTranscriptResponse(sessionId, executionContext) {
    return executionContext.lastResponseText || '';
  }

  /**
   * Trata chunks do stderr para fins de debug quando ativado.
   */
  handleStderr(chunk) {
    if (process.env.SLACK_BRIDGE_DEBUG === '1') {
      process.stderr.write(`[codex stderr] ${chunk}`);
    }
  }
}

module.exports = {
  CodexEngineAdapter,
  AsyncEventQueue,
  DEFAULT_BRAIN_DIR,
  TRANSCRIPT_RELATIVE_PATH,
};
