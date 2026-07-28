# Summary: Fix Bot.js CLI Timeout and Race Condition

## Changes Implemented
- **Execution Queue**: Created a `processQueue` and `executionQueue` system in `bot.js`. Instead of running `exec` immediately for each incoming Slack message, messages for the same Slack thread are queued. This ensures that only ONE `agy` CLI process runs per `sessionId` at any given time, preventing race conditions where multiple CLI processes corrupt the agent's memory or trip over each other when handling long-running backgrounds tasks.
- **CLI Print Timeout**: Appended `--print-timeout "24h"` to the `agy` CLI invocations. In "print mode" (when piping `stdin`), `agy` defaults to a 5-minute timeout. This would cause the CLI to crash prematurely if a background task or sub-agent ran longer than 5 minutes. The 24-hour timeout ensures it stays alive while waiting for schedules to finish.
- **MaxBuffer**: Increased `exec`'s `maxBuffer` limit to 10MB (`10 * 1024 * 1024`). This prevents the CLI from crashing with `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` if the agent's output produces large logs.

## Verification
- Code syntax was verified successfully.
- `slack_bridge` folder is ignored by git, so these changes don't need to be committed to the repo, but they are live in `bot.js`.
