# Refactor bot.js to Event-Driven Slack Bot

## 1. Goal
Refactor `slack_bridge/bot.js` from a synchronous I/O model (waiting for process `stdout`) to an asynchronous Event-Driven model by tailing the `transcript.jsonl` files. This ensures that background subagent completions and deferred CEO messages are properly forwarded to Slack.

## 2. Scope
This is a medium-scope feature that affects the core communication bridge of the StartupOS.

## 3. Requirements
- **REQ-001 (Decoupled Execution):** The bot must execute the `agy` CLI command without blocking or awaiting its `stdout` stream to finish the interaction loop.
- **REQ-002 (Global Transcript Watcher):** The bot must initialize a global watcher (using `chokidar`) on the directory `~/.gemini/antigravity-cli/brain/**/transcript.jsonl`.
- **REQ-003 (Thread Mapping):** The bot must maintain a persistent mapping between Slack `thread_ts` and Antigravity `conversation_id` in `thread_mapping.json`.
- **REQ-004 (Event Handling):** When a `transcript.jsonl` file is updated, the bot must parse the new lines. If a line is of type `USER_OUTPUT` (or a `PLANNER_RESPONSE` containing text meant for the user) and originates from `MODEL`, the bot must send this text to the corresponding Slack thread.
- **REQ-005 (Initial Feedback):** When a user sends a message, the bot should immediately acknowledge it and trigger the `agy` command, relying on the watcher to pick up subsequent responses.

## 4. Verification
- Manual verification: The user sends a command to the CEO that launches a background subagent. The CEO's final response (which occurs after the initial CLI command has exited) must successfully appear in the Slack thread.
