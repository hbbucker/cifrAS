# Fix Bot.js CLI Timeout and Race Condition

## Description
The Slack bridge (`bot.js`) spawns a new `agy` process for every incoming Slack message using `exec`. If a schedule or sub-agent is active, the previous `agy` process is still running. Spawning a second process for the same `sessionId` concurrently corrupts the agent's memory and causes a restart cycle. Furthermore, the `agy` CLI has a default `--print-timeout` of 5 minutes in non-interactive pipe mode, causing it to exit prematurely and fail long-running background tasks.

## Tasks
1. Introduce a per-thread execution queue in `bot.js` to ensure only one `agy` CLI runs at a time for any given Slack thread.
2. Add `--print-timeout 24h` to the `agy` command invocations to prevent the CLI from timing out during long-running tasks.
3. Increase `exec` `maxBuffer` to 10MB to prevent `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` crashes on verbose agents.

## Verification
- Run a schedule in the bot, send a second message immediately, and verify it queues instead of corrupting the memory.
- Verify that a task longer than 30 seconds doesn't time out the CLI.
