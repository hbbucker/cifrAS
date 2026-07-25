# Feature: StartupOS Agents

## 1. Context & Motivation
Currently, the CifrAS AI team (CEO, CTO, CPO, CMO, CRO, CFO, COO, Research, Data, QA) is documented in `AGENTS.md` and their prompts are stored as plain `.md` files inside `.gemini/agents/`.
While this serves as documentation, it does not allow the Antigravity engine to natively invoke these specific roles as autonomous subagents with their own isolated system prompts and tools.
The goal is to evolve the team into **persisted Antigravity subagents** (via a local plugin) so they can be natively invoked using the `invoke_subagent` tool, and we can iteratively assign them unique skills.

## 2. Requirements (WHAT)
- **REQ-01**: Create a local Antigravity plugin named `startupos` inside the workspace (`.gemini/plugins/startupos/`).
- **REQ-02**: Migrate all existing markdown agent profiles (`ceo.md`, `cto.md`, `po.md`, `maya-rivers.md`, `leo-sterling.md`, `alex-j-code.md`) into structured `.json` Antigravity Agent definitions inside `.gemini/plugins/startupos/agents/`.
- **REQ-03**: Configure each agent's permissions (`enable_mcp_tools`, `enable_subagent_tools`, `enable_write_tools`) according to their role. For example, the CEO should be able to invoke subagents; the CTO should have write tools to code; etc.
- **REQ-04**: Update `AGENTS.md` to reflect that the agents are now native Antigravity subagents loaded via the `startupos` plugin, and provide instructions on how the CEO can invoke them.

## 3. Architecture & Design (HOW)
We will leverage Antigravity's Plugin system. 
- A plugin is defined by a `plugin.json` in a directory under `.gemini/plugins/`.
- Subagents are defined as `.json` files inside the `agents/` subdirectory of the plugin.
The JSON format directly mirrors the `define_subagent` tool arguments:
```json
{
  "name": "ceo",
  "description": "Founder & CEO AI of CifrAS",
  "system_prompt": "...",
  "enable_mcp_tools": true,
  "enable_subagent_tools": true,
  "enable_write_tools": true
}
```

## 4. Execution Plan (Tasks)
- **Task 1**: Create the `.gemini/plugins/startupos` directory structure and `plugin.json`.
- **Task 2**: Read all existing `.md` files from `.gemini/agents/`.
- **Task 3**: Convert each `.md` file into a valid agent `.json` file inside `.gemini/plugins/startupos/agents/`.
- **Task 4**: Delete the old `.gemini/agents/` directory as it is now obsolete.
- **Task 5**: Update `AGENTS.md` documentation to point to the new plugin architecture.
