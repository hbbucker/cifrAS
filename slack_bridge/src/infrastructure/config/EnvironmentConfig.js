const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env'), quiet: true });

class EnvironmentConfig {
  static load() {
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    const slackAppToken = process.env.SLACK_APP_TOKEN;
    const llmEngine = process.env.LLM_ENGINE || 'antigravity';
    const workspaceDir = process.env.WORKSPACE_DIR || (fs.existsSync(path.join(process.cwd(), 'AGENTS.md')) ? process.cwd() : path.resolve(__dirname, '..', '..', '..', '..'));
    const allowedChannelId = process.env.SLACK_CHANNEL_ID || process.env.ALLOWED_CHANNEL_ID;

    return {
      slackBotToken,
      slackAppToken,
      llmEngine,
      workspaceDir,
      allowedChannelId,
      isDebug: process.env.SLACK_BRIDGE_DEBUG === '1',
    };
  }
}

module.exports = { EnvironmentConfig };
