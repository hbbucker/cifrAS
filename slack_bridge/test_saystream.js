require('dotenv').config();
const { App } = require('@slack/bolt');
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.event('message', async ({ event, client, sayStream }) => {
  if (event.bot_id || !event.text.includes('test_saystream')) return;
  console.log("Triggering sayStream test");
  
  try {
    if (!sayStream) {
      console.log("sayStream is not available in this version of Bolt");
      return;
    }
    const stream = sayStream();
    await stream.append({ markdown_text: "Starting..." });
    await new Promise(r => setTimeout(r, 1000));
    await stream.append({ markdown_text: " Doing something..." });
    await new Promise(r => setTimeout(r, 1000));
    await stream.append({ markdown_text: " Finished!" });
    await stream.stop();
    console.log("sayStream test finished");
  } catch (e) {
    console.error(e);
  }
});

(async () => {
  await app.start();
  console.log('⚡️ test_saystream is running!');
})();
