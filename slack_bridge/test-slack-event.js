require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.event('message', async ({ event }) => {
  console.log("RAW MESSAGE EVENT:", JSON.stringify(event));
});

(async () => {
  await app.start();
  console.log('Test bot running');
})();
