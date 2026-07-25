# Slack Bridge - Agy Streaming Spec

## Overview
Replace the Python SDK (`agent_runner.py`) dependency with direct invocations of the `agy` CLI using `echo "..." | agy --dangerously-skip-permissions`. Enable progressive text streaming in Slack using Bolt's `sayStream()` utility, and track tool usage asynchronously by tailing the agent's `transcript.jsonl`.

## Scope Classification
**Size:** Medium (<10 tasks, 1 file modified)
**Depth:** Specify -> Implement + Verify (Design and Tasks are skipped/implicit).

## Requirements
- **REQ-01 [Headless Exec]:** The Slack bridge MUST invoke `agy` by piping text into standard input, avoiding any TUI artifacts.
- **REQ-02 [Auto-Approve Tools]:** The CLI invocation MUST include `--dangerously-skip-permissions` to prevent headless executions from getting blocked waiting for user permission.
- **REQ-03 [Text Streaming]:** The bridge MUST consume the chunked standard output from `agy` in real-time and use `@slack/bolt`'s `sayStream()` utility to progressively update the Slack response.
- **REQ-04 [Tool Status Updates]:** The bridge MUST continue to tail the unique session's `transcript.jsonl` to detect `PLANNER_RESPONSE` events containing `tool_calls`.
- **REQ-05 [Decoupled Messages]:** The bridge MUST post two distinct messages per interaction:
  1. A primary "status" message updated via `client.chat.update` indicating if the agent is thinking or using tools (tracked via `transcript.jsonl`).
  2. A streaming response message created and managed by `sayStream()`, displaying the actual agent output.
- **REQ-06 [Session Recovery]:** The bridge MUST track `thread_ts` mappings to `conversation_id`. For new threads, it MUST inject a unique UUID into the initial prompt and scan `~/.gemini/antigravity-cli/brain/*/transcript.jsonl` to reliably discover the new conversation ID assigned by the CLI.

## Gray Areas / Discuss (None)
No ambiguous gray areas remain; the previous ToT (Tree of Thoughts) successfully validated `sayStream` viability and chunked standard output buffering.

## Next Step
Proceed directly to Execute (inline task list in `implement.md` logic).
