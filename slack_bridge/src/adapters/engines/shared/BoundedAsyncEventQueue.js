const { EnginePipelineError } = require('../../../domain/errors/EnginePipelineError');

const DEFAULT_MAX_EVENTS = 128;
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;
const DEFAULT_LOW_EVENTS = 64;
const DEFAULT_LOW_BYTES = 4 * 1024 * 1024;
const DEFAULT_MAX_EVENT_BYTES = 4 * 1024 * 1024;

function measureEventBytes(event) {
  try {
    return Buffer.byteLength(JSON.stringify(event), 'utf8');
  } catch {
    return DEFAULT_MAX_EVENT_BYTES + 1;
  }
}

class BoundedAsyncEventQueue {
  constructor({
    maxEvents = DEFAULT_MAX_EVENTS,
    maxBytes = DEFAULT_MAX_BYTES,
    lowEvents = DEFAULT_LOW_EVENTS,
    lowBytes = DEFAULT_LOW_BYTES,
    maxEventBytes = DEFAULT_MAX_EVENT_BYTES,
    onPressure = () => {},
    onDrain = () => {},
  } = {}) {
    this.maxEvents = maxEvents;
    this.maxBytes = maxBytes;
    this.lowEvents = lowEvents;
    this.lowBytes = lowBytes;
    this.maxEventBytes = maxEventBytes;
    this.onPressure = onPressure;
    this.onDrain = onDrain;
    this.items = [];
    this.itemBytes = 0;
    this.consumers = [];
    this.spaceWaiters = [];
    this.closed = false;
    this.cancelled = false;
    this.acceptingEvents = true;
    this.pressured = false;
    this.terminalAccepted = false;
    this.maxObservedDepth = 0;
    this.maxObservedBytes = 0;
  }

  async enqueue(event) {
    if (!this.acceptingEvents) return false;
    const byteCount = measureEventBytes(event);
    if (byteCount > this.maxEventBytes) throw new EnginePipelineError('ENGINE_STREAM_EVENT_LIMIT');
    while (this.acceptingEvents && !this.closed && !this.cancelled && this.wouldExceed(byteCount)) {
      this.enterPressure();
      await new Promise((resolve) => this.spaceWaiters.push(resolve));
    }
    if (!this.acceptingEvents || this.closed || this.cancelled || this.terminalAccepted) return false;
    this.deliverOrStore(event, byteCount);
    return true;
  }

  stopAcceptingEvents() {
    if (!this.acceptingEvents) return false;
    this.acceptingEvents = false;
    this.wakeSpaceWaiters();
    return true;
  }

  async complete(terminalEvent) {
    if (this.closed || this.cancelled || this.terminalAccepted) return false;
    this.terminalAccepted = true;
    const byteCount = measureEventBytes(terminalEvent);
    if (byteCount > this.maxEventBytes) {
      this.terminalAccepted = false;
      throw new EnginePipelineError('ENGINE_STREAM_EVENT_LIMIT');
    }
    while (!this.cancelled && this.wouldExceed(byteCount)) {
      this.enterPressure();
      await new Promise((resolve) => this.spaceWaiters.push(resolve));
    }
    if (this.cancelled) return false;
    this.deliverOrStore(terminalEvent, byteCount);
    this.closed = true;
    this.wakeConsumersWhenEmpty();
    this.wakeSpaceWaiters();
    return true;
  }

  fail(error) {
    if (this.closed || this.cancelled) return false;
    this.failure = error;
    this.closed = true;
    this.wakeConsumersWhenEmpty();
    this.wakeSpaceWaiters();
    return true;
  }

  cancel() {
    if (this.cancelled) return false;
    this.cancelled = true;
    this.closed = true;
    this.items = [];
    this.itemBytes = 0;
    while (this.consumers.length > 0) this.consumers.shift().resolve({ done: true, value: undefined });
    this.wakeSpaceWaiters();
    return true;
  }

  close() {
    if (this.closed) return false;
    this.closed = true;
    this.wakeConsumersWhenEmpty();
    this.wakeSpaceWaiters();
    return true;
  }

  wouldExceed(byteCount) {
    return this.items.length >= this.maxEvents || this.itemBytes + byteCount > this.maxBytes;
  }

  enterPressure() {
    if (this.pressured) return;
    this.pressured = true;
    this.onPressure();
  }

  deliverOrStore(event, byteCount) {
    if (this.consumers.length > 0) {
      this.consumers.shift().resolve({ done: false, value: event });
      return;
    }
    this.items.push({ event, byteCount });
    this.itemBytes += byteCount;
    this.maxObservedDepth = Math.max(this.maxObservedDepth, this.items.length);
    this.maxObservedBytes = Math.max(this.maxObservedBytes, this.itemBytes);
  }

  wakeSpaceWaiters() {
    while (this.spaceWaiters.length > 0) this.spaceWaiters.shift()();
  }

  drainIfBelowWatermarks() {
    if (!this.pressured || this.items.length > this.lowEvents || this.itemBytes > this.lowBytes) return;
    this.pressured = false;
    this.onDrain();
    this.wakeSpaceWaiters();
  }

  wakeConsumersWhenEmpty() {
    if (this.items.length > 0) return;
    while (this.consumers.length > 0) {
      const consumer = this.consumers.shift();
      if (this.failure) consumer.reject(this.failure);
      else consumer.resolve({ done: true, value: undefined });
    }
  }

  async next() {
    if (this.items.length > 0) {
      const { event, byteCount } = this.items.shift();
      this.itemBytes -= byteCount;
      this.drainIfBelowWatermarks();
      this.wakeConsumersWhenEmpty();
      return { done: false, value: event };
    }
    if (this.closed) {
      if (this.failure) throw this.failure;
      return { done: true, value: undefined };
    }
    return new Promise((resolve, reject) => this.consumers.push({ resolve, reject }));
  }

  [Symbol.asyncIterator]() {
    return this;
  }
}

module.exports = {
  BoundedAsyncEventQueue,
  DEFAULT_MAX_EVENTS,
  DEFAULT_MAX_BYTES,
  DEFAULT_LOW_EVENTS,
  DEFAULT_LOW_BYTES,
  DEFAULT_MAX_EVENT_BYTES,
  measureEventBytes,
};
