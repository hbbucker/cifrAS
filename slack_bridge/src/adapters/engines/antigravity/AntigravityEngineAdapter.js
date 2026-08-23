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
      const roleByConversation = {};
      if (boundSessionId) roleByConversation[boundSessionId] = 'CEO';

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
        // 1. Vincula Session ID
        if (event && event.event === 'init' && event.conversation_id) {
          boundSessionId = event.conversation_id;
          roleByConversation[boundSessionId] = 'CEO';
          if (callbacks.onSessionBound) callbacks.onSessionBound(boundSessionId);
        }

        // 2. Detecção de Subagentes via stream
        const subagents = event && event.event === 'step_update' && event.step_update && event.step_update.subagent_info && event.step_update.subagent_info.subagents;
        if (Array.isArray(subagents)) {
          for (const sub of subagents) {
            const role = sub.role || sub.type_name || 'Especialista';
            if (sub.conversation_id && !roleByConversation[sub.conversation_id]) {
              roleByConversation[sub.conversation_id] = role;
              if (callbacks.onSubagentSpawned) {
                callbacks.onSubagentSpawned(role, sub.conversation_id);
              }
            }
          }
        }

        // 3. Streaming de deltas de pensamento / texto
        if (event && event.event === 'step_update' && event.step_update && event.step_update.step_type === 'agent_response') {
          const convId = event.step_update.conversation_id || boundSessionId;
          const role = roleByConversation[convId] || 'CEO';
          const text = event.step_update.text_delta || event.step_update.text;
          if (text && callbacks.onStreamDelta) {
            callbacks.onStreamDelta(role, text);
          }
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
