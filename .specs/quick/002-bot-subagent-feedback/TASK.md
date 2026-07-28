# Bot Subagent Feedback tracking

## Description
The Slack bridge (`bot.js`) only tracks the `transcript.jsonl` of the main agent's session. When the main agent delegates work to a sub-agent (e.g. `CTO AI`), the sub-agent's activities (tool calls, thoughts, responses) happen in a different session ID. Since the bridge ignores unmapped sessions, it provides no feedback to the user, leaving them with an "Aguardando..." feeling until the subagent finishes.

## Tasks
1. Update `processNewLines` to parse `GENERIC` log entries and detect subagent creation (`conversation ID: ...`).
2. Map the newly spawned subagent ID to the current `thread_ts` inside the `mapping` object (`mData.subagents`).
3. Update `handleFileChange` to process log lines for any mapped subagent ID.
4. Distinguish subagent logs in Slack by prefixing messages with `[Sub-agent]`.

## Verification
- Verify code syntax.
- `slack_bridge` is untracked by Git, so no commit is needed, but the logic will be live.
