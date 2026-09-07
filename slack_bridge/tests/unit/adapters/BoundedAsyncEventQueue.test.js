const test = require('node:test');
const assert = require('node:assert/strict');
const { BoundedAsyncEventQueue } = require('../../../src/adapters/engines/shared/BoundedAsyncEventQueue');

test('BoundedAsyncEventQueue preserves order and appends one terminal event', async () => {
  const queue = new BoundedAsyncEventQueue();
  await queue.enqueue({ order: 1 });
  await queue.enqueue({ order: 2 });
  await queue.complete({ terminal: true });
  assert.equal(await queue.complete({ terminal: 'late' }), false);
  const values = [];
  for await (const value of queue) values.push(value);
  assert.deepEqual(values, [{ order: 1 }, { order: 2 }, { terminal: true }]);
});

test('BoundedAsyncEventQueue applies pressure and resumes below both low watermarks', async () => {
  const signals = [];
  const queue = new BoundedAsyncEventQueue({
    maxEvents: 2,
    maxBytes: 1000,
    lowEvents: 1,
    lowBytes: 500,
    onPressure: () => signals.push('pressure'),
    onDrain: () => signals.push('drain'),
  });
  await queue.enqueue({ order: 1 });
  await queue.enqueue({ order: 2 });
  let thirdAccepted = false;
  const third = queue.enqueue({ order: 3 }).then(() => { thirdAccepted = true; });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(thirdAccepted, false);
  assert.deepEqual(signals, ['pressure']);
  assert.equal((await queue.next()).value.order, 1);
  await third;
  assert.deepEqual(signals, ['pressure', 'drain']);
  assert.equal((await queue.next()).value.order, 2);
  await queue.complete({ terminal: true });
  assert.equal((await queue.next()).value.order, 3);
  assert.equal((await queue.next()).value.terminal, true);
});

test('BoundedAsyncEventQueue rejects oversized events safely', async () => {
  const queue = new BoundedAsyncEventQueue({ maxEventBytes: 32 });
  await assert.rejects(queue.enqueue({ secret: 's'.repeat(100) }), (error) => {
    assert.equal(error.code, 'ENGINE_STREAM_EVENT_LIMIT');
    assert.doesNotMatch(error.message, /ssss/);
    return true;
  });
});

test('BoundedAsyncEventQueue cancellation wakes blocked producers and consumers', async () => {
  const queue = new BoundedAsyncEventQueue({ maxEvents: 1, lowEvents: 0 });
  await queue.enqueue({ order: 1 });
  const blockedProducer = queue.enqueue({ order: 2 });
  queue.cancel();
  assert.equal(await blockedProducer, false);
  assert.deepEqual(await queue.next(), { done: true, value: undefined });
  assert.equal(queue.cancel(), false);
  assert.equal(await queue.complete({ terminal: true }), false);
});

test('BoundedAsyncEventQueue stops partial acceptance while preserving one terminal', async () => {
  const queue = new BoundedAsyncEventQueue();
  assert.equal(queue.stopAcceptingEvents(), true);
  assert.equal(await queue.enqueue({ type: 'late' }), false);
  assert.equal(await queue.complete({ type: 'terminal' }), true);
  assert.deepEqual((await queue.next()).value, { type: 'terminal' });
  assert.equal((await queue.next()).done, true);
});

test('BoundedAsyncEventQueue exposes bounded maximum observations only', async () => {
  const queue = new BoundedAsyncEventQueue();
  for (let index = 0; index < 128; index += 1) await queue.enqueue({ index });
  assert.equal(queue.maxObservedDepth, 128);
  assert.ok(queue.maxObservedBytes <= 8 * 1024 * 1024);
  queue.cancel();
});
