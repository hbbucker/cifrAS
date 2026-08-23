const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { ILLMEnginePort } = require('../../../domain/ports/ILLMEnginePort');
const { AntigravityStreamParser } = require('./AntigravityStreamParser');

const DEFAULT_BRAIN_DIR = path.join(os.homedir(), '.gemini', 'antigravity-cli', 'brain');

class AntigravityEngineAdapter extends ILLMEnginePort {
  constructor({ brainDir = DEFAULT_BRAIN_DIR, agyBin = 'agy', spawnFn = spawn } = {}) {
    super();
    this.brainDir = brainDir;
    this.agyBin = agyBin;
    this.spawn = spawnFn;
  }

  async execute({ prompt, sessionId, workspaceDir, uniqueId }, callbacks = {}) {
    const args = ['-p', prompt, '--add-dir', workspaceDir];
    if (typeof sessionId === 'string' && sessionId.trim()) {
      args.push('--conversation', sessionId.trim());
    }
    args.push('--print-timeout', '1h', '--dangerously-skip-permissions', '--output-format', 'stream-json');

    return new Promise((resolve) => {
      let boundSessionId = sessionId || null;
      let finalResponseText = '';

      const child = this.spawn(this.agyBin, args, {
        cwd: workspaceDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      if (child.stderr) {
        child.stderr.on('data', (chunk) => {
          if (process.env.SLACK_BRIDGE_DEBUG === '1') {
            process.stderr.write(`[agy stderr] ${chunk}`);
          }
        });
      }

      const streamParser = AntigravityStreamParser.create((event) => {
        // 1. Vincula Session ID da sessão raiz
        if (event && event.event === 'init' && event.conversation_id) {
          boundSessionId = event.conversation_id;
          if (callbacks.onSessionBound) {
            callbacks.onSessionBound({ sessionId: boundSessionId });
          }
        }

        // 2. Notificação de Subagente descoberto (dados agnósticos do protocolo)
        const subagents = event && event.event === 'step_update' && event.step_update && event.step_update.subagent_info && event.step_update.subagent_info.subagents;
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
        if (event && event.event === 'step_update' && event.step_update && event.step_update.step_type === 'agent_response') {
          const convId = event.step_update.conversation_id || boundSessionId;
          const text = event.step_update.text_delta || event.step_update.text;
          if (text && callbacks.onStreamDelta) {
            callbacks.onStreamDelta({
              conversationId: convId,
              textChunk: text,
            });
          }
        }

        // 4. Mudança de status da execução
        if (event && event.event === 'step_update' && event.step_update && event.step_update.status_text && callbacks.onStatusUpdate) {
          const convId = event.step_update.conversation_id || boundSessionId;
          callbacks.onStatusUpdate({
            conversationId: convId,
            statusText: event.step_update.status_text,
          });
        }
      });

      child.stdout.on('data', streamParser);

      const finish = (exitCode, error = null) => {
        streamParser.flush();

        // Se tiver boundSessionId, lê a resposta final diretamente do transcript gravado
        if (boundSessionId) {
          const transcriptPath = path.join(this.brainDir, boundSessionId, '.system_generated', 'logs', 'transcript.jsonl');
          if (fs.existsSync(transcriptPath)) {
            try {
              const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
              for (let i = lines.length - 1; i >= 0; i--) {
                const parsed = JSON.parse(lines[i]);
                if (parsed.type === 'PLANNER_RESPONSE' && parsed.content) {
                  finalResponseText = parsed.content;
                  break;
                }
              }
            } catch {}
          }
        }

        resolve({
          exitCode: typeof exitCode === 'number' ? exitCode : 0,
          responseText: finalResponseText,
          error,
          filePaths: [],
        });
      };

      child.once('close', (code) => finish(code));
      child.once('error', (err) => finish(1, err));
    });
  }
}

module.exports = { AntigravityEngineAdapter, DEFAULT_BRAIN_DIR };
