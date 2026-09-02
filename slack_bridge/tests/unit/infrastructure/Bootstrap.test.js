process.env.OPENAI_API_KEY = "test";
const test = require('node:test');
const assert = require('node:assert/strict');
const { createEngine } = require('../../../src/infrastructure/bootstrap');
const { EnvironmentConfig } = require('../../../src/infrastructure/config/EnvironmentConfig');
const { MockEngineAdapter } = require('../../../src/adapters/engines/mock/MockEngineAdapter');
const { OpenAIEngineAdapter } = require('../../../src/adapters/engines/openai/OpenAIEngineAdapter');
const { AntigravityEngineAdapter } = require('../../../src/adapters/engines/antigravity/AntigravityEngineAdapter');

test('Bootstrap: createEngine factory returns correct engine instance', () => {
  const mockEngine = createEngine('mock');
  assert.ok(mockEngine instanceof MockEngineAdapter);

  const openaiEngine = createEngine('openai');
  assert.ok(openaiEngine instanceof OpenAIEngineAdapter);

  const agyEngine = createEngine('antigravity');
  assert.ok(agyEngine instanceof AntigravityEngineAdapter);

  const defaultEngine = createEngine('unknown');
  assert.ok(defaultEngine instanceof AntigravityEngineAdapter);
});

test('EnvironmentConfig: loads environment defaults safely', () => {
  const config = EnvironmentConfig.load();
  assert.ok(typeof config === 'object');
  assert.ok(config.workspaceDir);
  assert.ok(config.llmEngine);
});
