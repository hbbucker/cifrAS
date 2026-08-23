const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');
const { AntigravityStreamParser } = require('./AntigravityStreamParser');

const DEFAULT_BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');
const TRANSCRIPT_RELATIVE_PATH = path.join('.system_generated', 'logs', 'transcript.jsonl');

class AntigravityEngineAdapter extends ILLMEnginePort {
  constructor({ brainDir = DEFAULT_BRAIN_DIR, agyBin = 'agy', spawnFn = spawn } = {}) {
    super();
    this.brainDir = brainDir;
    this.agyBin = agyBin;
    this.spawn = spawnFn;
  }

  /**
   * Executa um turno no motor Antigravity orquestrando o subprocesso, o stream e o transcript final.
   */
  async execute({ prompt, sessionId, workspaceDir, uniqueId }, callbacks = {}) {
    const args = this.buildCliArgs({ prompt, sessionId, workspaceDir });
    const executionContext = { boundSessionId: sessionId || null };

    return new Promise((resolve) => {
      const child = this.spawn(this.agyBin, args, {
        cwd: workspaceDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      if (child.stderr) {
        child.stderr.on('data', (chunk) => this.handleStderr(chunk));
      }

      const streamParser = AntigravityStreamParser.create((event) => {
        this.translateStreamEvent(event, callbacks, executionContext);
      });

      child.stdout.on('data', streamParser);

      const finish = async (exitCode, error = null) => {
        streamParser.flush();

        const responseText = await this.readTranscriptResponse(executionContext.boundSessionId);

        resolve({
          exitCode: typeof exitCode === 'number' ? exitCode : 0,
          responseText,
          error,
          filePaths: [],
        });
      };

      child.once('close', (code) => finish(code));
      child.once('error', (err) => finish(1, err));
    });
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
   * Traduz eventos NDJSON emitidos pelo protocolo Antigravity para os callbacks agnósticos do domínio.
   */
  translateStreamEvent(event, callbacks = {}, executionContext = {}) {
    if (!event) return;

    // 1. Vincula Session ID da sessão raiz
    if (event.event === 'init' && event.conversation_id) {
      executionContext.boundSessionId = event.conversation_id;
      if (callbacks.onSessionBound) {
        callbacks.onSessionBound({ sessionId: executionContext.boundSessionId });
      }
    }

    // 2. Notificação de Subagente descoberto (dados agnósticos do protocolo)
    const subagents = event.event === 'step_update' && event.step_update && event.step_update.subagent_info && event.step_update.subagent_info.subagents;
    if (Array.isArray(subagents)) {
      for (const sub of subagents) {
        if (sub.conversation_id && callbacks.onSubagentDiscovered) {
          callbacks.onSubagentDiscovered({
            conversationId: sub.conversation_id,
            typeName: sub.role || sub.type_name || null,
            metadata: sub,
          });
        }
      }
    }

    // 3. Streaming de deltas de pensamento / texto por conversation_id
    if (event.event === 'step_update' && event.step_update && event.step_update.step_type === 'agent_response') {
      const convId = event.step_update.conversation_id || executionContext.boundSessionId;
      const text = event.step_update.text_delta || event.step_update.text;
      if (text && callbacks.onStreamDelta) {
        callbacks.onStreamDelta({
          conversationId: convId,
          textChunk: text,
        });
      }
    }

    // 4. Mudança de status da execução
    if (event.event === 'step_update' && event.step_update && event.step_update.status_text && callbacks.onStatusUpdate) {
      const convId = event.step_update.conversation_id || executionContext.boundSessionId;
      callbacks.onStatusUpdate({
        conversationId: convId,
        statusText: event.step_update.status_text,
      });
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
  DEFAULT_BRAIN_DIR,
  TRANSCRIPT_RELATIVE_PATH,
};
