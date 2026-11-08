const { describe, it } = require('node:test');
const assert = require('node:assert');
const { OpenAIEngineAdapter } = require('../../../../src/adapters/engines/openai/OpenAIEngineAdapter');
const { EngineInstructionDTO } = require('../../../../src/domain/dtos/EngineInstructionDTO');

describe('OpenAIEngineAdapter', () => {
  it('should stream chunks and complete successfully', async () => {
    const mockStream = (async function* () {
      yield { choices: [{ delta: { content: 'Hello' } }] };
      yield { choices: [{ delta: { content: ' World' } }] };
    })();
    
    const mockClient = {
      chat: {
        completions: {
          create: async () => mockStream
        }
      }
    };
    
    const adapter = new OpenAIEngineAdapter({ client: mockClient });
    const instruction = new EngineInstructionDTO({
      prompt: 'test prompt',
      sessionId: 'sess-123',
      workspaceDir: '/tmp'
    });
    
    const events = [];
    for await (const event of adapter.executeStream(instruction)) {
      events.push(event);
    }
    
    assert.strictEqual(events.length, 4);
    assert.strictEqual(events[0].type, 'SESSION_BOUND');
    assert.strictEqual(events[1].type, 'TEXT_DELTA_EMITTED');
    assert.strictEqual(events[1].payload.textChunk, 'Hello');
    assert.strictEqual(events[2].type, 'TEXT_DELTA_EMITTED');
    assert.strictEqual(events[2].payload.textChunk, ' World');
    assert.strictEqual(events[3].type, 'EXECUTION_COMPLETED');
    assert.strictEqual(events[3].payload.result.responseText, 'Hello World');
  });

  it('should handle errors', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: async () => { throw new Error('API error'); }
        }
      }
    };
    
    const adapter = new OpenAIEngineAdapter({ client: mockClient });
    const instruction = new EngineInstructionDTO({
      prompt: 'test',
      workspaceDir: '/tmp'
    });
    
    const events = [];
    for await (const event of adapter.executeStream(instruction)) {
      events.push(event);
    }
    
    assert.strictEqual(events.length, 2);
    assert.strictEqual(events[0].type, 'SESSION_BOUND');
    assert.strictEqual(events[1].type, 'EXECUTION_FAILED');
    assert.strictEqual(events[1].payload.error.message, 'API error');
  });
});
