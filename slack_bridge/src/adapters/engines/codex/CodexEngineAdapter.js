const { spawn } = require('node:child_process');
const net = require('node:net');
const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');
const { EngineEvent } = require('../../../domain/events/EngineEvent');
const { EnginePipelineError } = require('../../../domain/errors/EnginePipelineError');
const { EngineProcessRunner } = require('../shared/EngineProcessRunner');

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

class CodexEngineAdapter extends ILLMEnginePort {
  constructor({ cliBin = 'codex', spawnFn = spawn, inactivityTimeoutMs = 300_000,
    maxTurnTimeoutMs = 7_200_000, turnTimeoutMs, runnerOptions = {} } = {}) {
    super();
    this.cliBin = cliBin;
    this.inactivityTimeoutMs = Number(process.env.LLM_INACTIVITY_TIMEOUT_MS)
      || (turnTimeoutMs !== undefined ? turnTimeoutMs : inactivityTimeoutMs);
    this.maxTurnTimeoutMs = Number(process.env.LLM_MAX_TURN_TIMEOUT_MS) || maxTurnTimeoutMs;
    this.runner = new EngineProcessRunner({ spawnFn, inactivityTimeoutMs: this.inactivityTimeoutMs,
      maxTurnTimeoutMs: this.maxTurnTimeoutMs, ...runnerOptions });
  }

  async *executeStream(instruction) {
    const executionContext = { boundSessionId: instruction.sessionId || null, lastResponseText: '' };
    const env = { ...process.env };
    if (await isProxyRunning(8787)) env.CLOUD_CODE_URL = 'http://localhost:8787';
    yield* this.runner.execute({
      engine: 'codex', command: this.cliBin, args: this.buildCliArgs(instruction),
      cwd: instruction.workspaceDir, env, executionContext,
      translateRecord: (record, context) => this.translateRecord(record, context),
      resolveFilePaths: async () => [],
    });
  }

  buildCliArgs({ prompt, sessionId, workspaceDir }) {
    const args = ['exec'];
    if (typeof sessionId === 'string' && sessionId.trim()) args.push('resume', sessionId.trim());
    args.push(prompt, '--add-dir', workspaceDir, '--dangerously-bypass-approvals-and-sandbox', '--json');
    return args;
  }

  translateRecord(record, executionContext) {
    const events = [];
    if (record.type === 'thread.started') {
      if (record.thread_id) {
        executionContext.boundSessionId = record.thread_id;
        events.push(EngineEvent.sessionBound(record.thread_id));
      }
      return { events, terminal: null };
    }
    if (record.type === 'item.completed' && record.item?.type === 'agent_message') {
      const text = typeof record.item.text === 'string' ? record.item.text : '';
      executionContext.lastResponseText = text;
      if (text && executionContext.boundSessionId) {
        events.push(EngineEvent.milestoneCompleted(executionContext.boundSessionId, null, text, {}));
        events.push(EngineEvent.textDeltaEmitted(executionContext.boundSessionId, text));
      }
      return { events, terminal: null };
    }
    if (record.type === 'item.started' && record.item) {
      if (record.item.type === 'command_execution') {
        events.push(EngineEvent.statusUpdated(executionContext.boundSessionId,
          `Executando: ${record.item.command || ''}`));
      } else if (record.item.type === 'tool_use') {
        events.push(EngineEvent.statusUpdated(executionContext.boundSessionId,
          `Tools: ${record.item.tool_name || ''}`));
      }
      return { events, terminal: null };
    }
    if (record.type === 'turn.completed') {
      const responseText = executionContext.lastResponseText.trim();
      return { events, terminal: responseText
        ? { kind: 'success', responseText, error: null, protocolType: 'turn.completed' }
        : { kind: 'failure', responseText: '',
          error: new EnginePipelineError('ENGINE_PROTOCOL_MISSING_RESPONSE'), protocolType: 'turn.completed' } };
    }
    if (record.type === 'turn.failed' || record.type === 'error') {
      return { events, terminal: { kind: 'failure', responseText: '',
        error: new EnginePipelineError('ENGINE_PROTOCOL_FAILURE'), protocolType: record.type } };
    }
    return null;
  }
}

module.exports = { CodexEngineAdapter };
