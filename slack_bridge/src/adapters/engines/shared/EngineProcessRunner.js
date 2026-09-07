const { spawn } = require('node:child_process');
const { EngineEvent } = require('../../../domain/events/EngineEvent');
const { TurnResultDTO } = require('../../../domain/dtos/TurnResultDTO');
const { EnginePipelineError } = require('../../../domain/errors/EnginePipelineError');
const { JsonLineDecoder } = require('./JsonLineDecoder');
const { BoundedAsyncEventQueue } = require('./BoundedAsyncEventQueue');

const DEFAULT_INACTIVITY_TIMEOUT_MS = 300_000;
const DEFAULT_MAX_TURN_TIMEOUT_MS = 7_200_000;
const DEFAULT_TERMINAL_GRACE_MS = 250;
const DEFAULT_TERMINATION_GRACE_MS = 2_000;
const DEFAULT_CLEANUP_CONFIRM_MS = 500;

function delay(milliseconds) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, milliseconds);
    timer.unref?.();
  });
}

class EngineProcessRunner {
  constructor({
    spawnFn = spawn,
    platform = process.platform,
    inactivityTimeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS,
    maxTurnTimeoutMs = DEFAULT_MAX_TURN_TIMEOUT_MS,
    terminalGraceMs = DEFAULT_TERMINAL_GRACE_MS,
    terminationGraceMs = DEFAULT_TERMINATION_GRACE_MS,
    cleanupConfirmMs = DEFAULT_CLEANUP_CONFIRM_MS,
    maxLineBytes,
    queueOptions = {},
  } = {}) {
    this.spawn = spawnFn;
    this.platform = platform;
    this.inactivityTimeoutMs = inactivityTimeoutMs;
    this.maxTurnTimeoutMs = maxTurnTimeoutMs;
    this.terminalGraceMs = terminalGraceMs;
    this.terminationGraceMs = terminationGraceMs;
    this.cleanupConfirmMs = cleanupConfirmMs;
    this.maxLineBytes = maxLineBytes;
    this.queueOptions = queueOptions;
  }

  async *execute({
    engine,
    command,
    args,
    cwd,
    env,
    executionContext = {},
    translateRecord,
    classifyStderr = () => {},
    getPriorityFailure = () => null,
    resolveFilePaths = async () => [],
    maxLineBytes = this.maxLineBytes,
  }) {
    const state = this.createState(engine);
    let child;
    let inactivityTimer;
    let maxTurnTimer;
    let successTimer;
    let processingChain = Promise.resolve();
    let records = [];

    const queue = new BoundedAsyncEventQueue({
      ...this.queueOptions,
      onPressure: () => {
        state.metrics.backpressurePauseCount += 1;
        child?.stdout?.pause?.();
      },
      onDrain: () => child?.stdout?.resume?.(),
    });

    const diagnostic = (entry) => {
      if (entry.code === 'ENGINE_STREAM_MALFORMED_LINE') state.metrics.malformedLineCount += 1;
      if (entry.code === 'ENGINE_STREAM_UNKNOWN_EVENT') state.metrics.unknownEventCount += 1;
    };
    const decoder = new JsonLineDecoder({
      maxLineBytes,
      onRecord: (record) => records.push(record),
      onDiagnostic: diagnostic,
    });

    let resolveClosed;
    const closedPromise = new Promise((resolve) => { resolveClosed = resolve; });

    const clearExecutionTimers = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (maxTurnTimer) clearTimeout(maxTurnTimer);
      if (successTimer) clearTimeout(successTimer);
    };

    const resetInactivityTimer = () => {
      if (state.finalizationStarted || this.inactivityTimeoutMs <= 0) return;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        requestFinalization({
          kind: 'failure',
          error: new EnginePipelineError('ENGINE_PROCESS_TIMEOUT'),
          protocolType: 'inactivity_timeout',
        }, 'inactivity_timeout');
      }, this.inactivityTimeoutMs);
      inactivityTimer.unref?.();
    };

    const emitTerminal = async (candidate, reason) => {
      const priorityFailure = state.finalizationAllowsPriorityFailure
        || state.finalizationReason === 'quota'
        ? getPriorityFailure(executionContext)
        : null;
      const selectedCandidate = priorityFailure || candidate;
      const selectedReason = priorityFailure ? 'quota' : reason;
      state.metrics.terminalReason = selectedReason;
      state.metrics.maxQueueDepth = queue.maxObservedDepth;
      state.metrics.maxQueueBytes = queue.maxObservedBytes;

      if (selectedCandidate.kind === 'success') {
        const filePaths = await resolveFilePaths(executionContext);
        await queue.complete(EngineEvent.executionCompleted(new TurnResultDTO({
          exitCode: typeof state.exitCode === 'number' ? state.exitCode : 0,
          responseText: selectedCandidate.responseText,
          filePaths,
          error: null,
          metrics: state.metrics,
        })));
      } else {
        await queue.complete(EngineEvent.executionFailed(
          selectedCandidate.error || new EnginePipelineError('ENGINE_PROCESS_FAILURE'),
          typeof state.exitCode === 'number' ? state.exitCode : 1
        ));
      }
      state.terminalEmitted = true;
    };

    const finalize = async (candidate, reason) => {
      if (state.finalizationStarted) return;
      state.finalizationStarted = true;
      state.finalizationReason = reason;
      state.finalizationAllowsPriorityFailure = candidate.kind === 'success'
        && reason === 'protocol_success';
      state.acceptingRecords = false;
      queue.stopAcceptingEvents();
      clearExecutionTimers();
      try {
        await processingChain;
        const decoderFailure = decoder.end();
        await processRecords();
        const effectiveCandidate = decoderFailure
          ? { kind: 'failure', error: decoderFailure, protocolType: 'decoder_failure' }
          : candidate;
        await this.cleanupChild(child, state, closedPromise);
        if (!state.cleanupConfirmed && state.cleanupInitiated && child?.pid) {
          await emitTerminal({
            kind: 'failure',
            error: new EnginePipelineError('ENGINE_PROCESS_CLEANUP_FAILED'),
            protocolType: 'cleanup_failure',
          }, 'cleanup_failure');
        } else {
          await emitTerminal(effectiveCandidate, reason);
        }
      } catch (error) {
        await emitTerminal({
          kind: 'failure',
          error: error instanceof EnginePipelineError ? error : new EnginePipelineError('ENGINE_PROCESS_FAILURE'),
          protocolType: 'runner_failure',
        }, 'runner_failure');
      }
    };

    const requestFinalization = (candidate, reason) => {
      if (state.finalizationStarted) return;
      if (successTimer) {
        clearTimeout(successTimer);
        successTimer = null;
      }
      void finalize(candidate, reason);
    };

    const scheduleSuccess = (candidate) => {
      if (state.finalizationStarted || successTimer) return;
      successTimer = setTimeout(() => {
        successTimer = null;
        void finalize(candidate, 'protocol_success');
      }, this.terminalGraceMs);
      successTimer.unref?.();
    };

    const processRecords = async () => {
      const currentRecords = records;
      records = [];
      for (const record of currentRecords) {
        if (!state.acceptingRecords) break;
        state.metrics.protocolEventCount += 1;
        state.sawProtocolEvent = true;
        const translation = await translateRecord(record, executionContext);
        if (!translation) {
          state.metrics.unknownEventCount += 1;
          continue;
        }
        for (const event of translation.events || []) {
          if (!state.acceptingRecords) break;
          await queue.enqueue(event);
        }
        if (translation.terminal) {
          state.sawProtocolTerminalEvent = true;
          state.terminalCandidate = translation.terminal;
          state.acceptingRecords = false;
          queue.stopAcceptingEvents();
          if (translation.terminal.kind === 'failure') {
            requestFinalization(translation.terminal, 'protocol_failure');
          } else {
            scheduleSuccess(translation.terminal);
          }
        }
      }
    };

    const processStdoutChunk = async (chunk) => {
      resetInactivityTimer();
      decoder.write(chunk);
      if (decoder.failure) {
        requestFinalization({ kind: 'failure', error: decoder.failure }, 'stream_limit');
        return;
      }
      await processRecords();
    };

    const drainStdoutProcessing = async () => {
      let observedChain;
      do {
        observedChain = processingChain;
        child?.stdout?.resume?.();
        await observedChain;
        await new Promise((resolve) => setImmediate(resolve));
      } while (observedChain !== processingChain || (child?.stdout?.readableLength || 0) > 0);
    };

    try {
      child = this.spawn(command, args, {
        cwd,
        env,
        shell: false,
        detached: this.platform !== 'win32',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      state.processGroupId = this.platform !== 'win32' && Number.isInteger(child.pid) && child.pid > 0
        ? child.pid
        : null;

      child.stdout?.on('data', (chunk) => {
        if (!state.acceptingRecords) return;
        child.stdout.pause?.();
        processingChain = processingChain
          .then(() => processStdoutChunk(chunk))
          .catch((error) => requestFinalization({
            kind: 'failure',
            error: error instanceof EnginePipelineError
              ? error
              : new EnginePipelineError('ENGINE_PROCESS_FAILURE'),
          }, error instanceof EnginePipelineError ? 'protocol_state_limit' : 'runner_failure'))
          .finally(() => {
            if (!queue.pressured && state.acceptingRecords) child.stdout.resume?.();
          });
      });

      child.stderr?.on('data', (chunk) => {
        const canClassifyPriorityFailure = !state.closed
          && !state.terminalEmitted
          && !state.consumerCancelled
          && (!state.finalizationStarted || state.finalizationAllowsPriorityFailure
            || state.finalizationReason === 'quota');
        if (!canClassifyPriorityFailure) return;
        if (!state.finalizationStarted) resetInactivityTimer();
        try {
          classifyStderr(chunk, executionContext);
          const priorityFailure = getPriorityFailure(executionContext);
          if (priorityFailure) {
            state.acceptingRecords = false;
            queue.stopAcceptingEvents();
            child.stdout?.pause?.();
            requestFinalization(priorityFailure, 'quota');
          }
        } catch {
          requestFinalization({ kind: 'failure', error: new EnginePipelineError('ENGINE_PROCESS_FAILURE') }, 'stderr_classifier_failure');
        }
      });

      child.once('error', () => {
        state.spawnError = true;
        resolveClosed();
        requestFinalization({ kind: 'failure', error: new EnginePipelineError('ENGINE_PROCESS_FAILURE') }, 'process_error');
      });
      child.once('exit', (code, signal) => {
        state.exitCode = code;
        state.signalCode = signal;
      });
      child.once('close', (code, signal) => {
        state.closed = true;
        if (typeof code === 'number') state.exitCode = code;
        if (signal) state.signalCode = signal;
        resolveClosed();
        void drainStdoutProcessing().then(async () => {
          const decoderFailure = decoder.end();
          await processRecords();
          if (state.finalizationStarted) return;
          if (decoderFailure) {
            requestFinalization({ kind: 'failure', error: decoderFailure }, 'stream_limit');
          } else if (getPriorityFailure(executionContext)) {
            requestFinalization(getPriorityFailure(executionContext), 'quota');
          } else if (typeof state.exitCode === 'number' && state.exitCode !== 0 && !state.cleanupInitiated) {
            requestFinalization({ kind: 'failure', error: new EnginePipelineError('ENGINE_PROCESS_FAILURE') }, 'nonzero_exit');
          } else if (state.terminalCandidate) {
            requestFinalization(state.terminalCandidate, state.terminalCandidate.kind === 'success' ? 'protocol_success' : 'protocol_failure');
          } else {
            requestFinalization({
              kind: 'failure',
              error: new EnginePipelineError('ENGINE_PROTOCOL_TERMINAL_MISSING'),
            }, 'terminal_missing');
          }
        });
      });

      resetInactivityTimer();
      if (this.maxTurnTimeoutMs > 0) {
        maxTurnTimer = setTimeout(() => requestFinalization({
          kind: 'failure',
          error: new EnginePipelineError('ENGINE_PROCESS_TIMEOUT'),
        }, 'max_turn_timeout'), this.maxTurnTimeoutMs);
        maxTurnTimer.unref?.();
      }

      for await (const event of queue) yield event;
    } catch {
      if (!state.terminalEmitted) {
        requestFinalization({ kind: 'failure', error: new EnginePipelineError('ENGINE_PROCESS_FAILURE') }, 'spawn_failure');
        for await (const event of queue) yield event;
      }
    } finally {
      clearExecutionTimers();
      if (!state.terminalEmitted) {
        state.consumerCancelled = true;
        state.acceptingRecords = false;
        queue.cancel();
        await this.cleanupChild(child, state, closedPromise);
      }
      child?.stdout?.removeAllListeners?.();
      child?.stderr?.removeAllListeners?.();
    }
  }

  createState(engine) {
    return {
      engine,
      acceptingRecords: true,
      sawProtocolEvent: false,
      sawProtocolTerminalEvent: false,
      terminalCandidate: null,
      spawnError: false,
      exitCode: null,
      signalCode: null,
      cleanupInitiated: false,
      cleanupConfirmed: false,
      processGroupId: null,
      closed: false,
      finalizationStarted: false,
      finalizationReason: null,
      finalizationAllowsPriorityFailure: false,
      consumerCancelled: false,
      terminalEmitted: false,
      metrics: {
        protocolEventCount: 0,
        malformedLineCount: 0,
        unknownEventCount: 0,
        backpressurePauseCount: 0,
        maxQueueDepth: 0,
        maxQueueBytes: 0,
        terminalReason: null,
        cleanupStrategy: process.platform === 'win32' ? 'process' : 'process_group',
        cleanupSignal: null,
        cleanupForced: false,
        cleanupConfirmed: false,
      },
    };
  }

  async cleanupChild(child, state, closedPromise) {
    if (!child || state.cleanupInitiated) return;
    state.cleanupInitiated = true;
    if (state.closed || child.exitCode !== null && child.exitCode !== undefined || child.signalCode) {
      state.cleanupConfirmed = true;
      state.metrics.cleanupConfirmed = true;
      return;
    }

    const sendSignal = (signal) => {
      state.metrics.cleanupSignal = signal;
      try {
        if (state.processGroupId) process.kill(-state.processGroupId, signal);
        else child.kill?.(signal);
        return true;
      } catch (error) {
        if (error?.code === 'ESRCH') {
          state.cleanupConfirmed = true;
          return false;
        }
        return false;
      }
    };

    sendSignal('SIGTERM');
    if (!state.processGroupId) {
      state.cleanupConfirmed = true;
      state.metrics.cleanupConfirmed = true;
      return;
    }
    await Promise.race([closedPromise, delay(this.terminationGraceMs)]);
    if (!state.closed) {
      state.metrics.cleanupForced = true;
      sendSignal('SIGKILL');
      await Promise.race([closedPromise, delay(this.cleanupConfirmMs)]);
    }
    if (state.closed) state.cleanupConfirmed = true;
    if (!state.cleanupConfirmed) {
      try {
        process.kill(-state.processGroupId, 0);
      } catch (error) {
        if (error?.code === 'ESRCH') state.cleanupConfirmed = true;
      }
    }
    state.metrics.cleanupConfirmed = state.cleanupConfirmed;
  }
}

module.exports = {
  EngineProcessRunner,
  DEFAULT_INACTIVITY_TIMEOUT_MS,
  DEFAULT_MAX_TURN_TIMEOUT_MS,
  DEFAULT_TERMINAL_GRACE_MS,
  DEFAULT_TERMINATION_GRACE_MS,
  DEFAULT_CLEANUP_CONFIRM_MS,
};
