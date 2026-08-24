const test = require('node:test');
const assert = require('node:assert/strict');
const { AntigravityStreamParser } = require('../../../src/adapters/engines/antigravity/AntigravityStreamParser');

test('AntigravityStreamParser: parses chunks and flushes valid JSON events', () => {
  const events = [];
  const parser = AntigravityStreamParser.create((ev) => events.push(ev));

  parser('{"event":"init","conversation_id":"c1"}\n{"event":"step_update"');
  assert.equal(events.length, 1);
  assert.equal(events[0].event, 'init');

  parser(',"step_update":{"step_type":"agent_response"}}\n');
  assert.equal(events.length, 2);
  assert.equal(events[1].step_update.step_type, 'agent_response');

  parser('{"event":"flush_test"}');
  parser.flush();
  assert.equal(events.length, 3);
  assert.equal(events[2].event, 'flush_test');
});
