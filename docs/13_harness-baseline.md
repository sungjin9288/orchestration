# Harness Baseline (2026-04)

## Purpose
Define a harness-first baseline for Orchestration 1.0 that is compatible with the existing
local-first / single-user-first / ops-first constraints. This is not a product feature expansion;
it is a development and execution posture: capabilities are added through harnesses (tools,
skills, MCP servers, and local adapters) instead of widening the core runtime surface.

## What "Harness-First" Means Here
- Capabilities are attached via harnesses (MCP servers, skills, local CLI wrappers) rather than
  embedding new logic into the core runtime.
- Harnesses remain optional and local. They must not flip the shipped default away from
  `local-stub` or `local-demo-only`.
- Harnesses must be auditable, with explicit boundaries documented in repo files.
- Harness use is gated by the same approval / review contracts already defined in the pack.

## External Reference Signals (2026-04)
These projects are signals, not direct dependencies:
- `markitdown` (Microsoft): MCP + CLI-style document-to-Markdown extraction. Useful as a harness
  for artifact preprocessing, not as a runtime dependency.
- `hermes-agent` (NousResearch): skills + memory + MCP gateway posture. Useful for thinking about
  skill registry + memory separation, not for multi-platform bots.
- `mempalace` (MemPalace): local-first memory store with MCP server posture. Useful as a
  local-only memory harness for future post-v1 work.
- `free-code` fork (Claude Code): CLI harness posture and loose prompt guardrails as a signal.
  Not a v1 dependency.

## Approved Harness Applications (Now)
1. **Document-to-Markdown preprocessing** via `markitdown` CLI
   - Keep it as a local optional CLI wrapper.
   - Use it only for artifact preprocessing or documentation ingestion.
   - Do not embed it into core runtime or auto-run flows.

2. **Memory harness (future-post-v1)**
   - Treat memory as an external harness with explicit ingest/export boundaries.
   - Only local-first memory stores are acceptable.
   - No networked, account-bound, or multi-tenant memory systems in v1.

## Out Of Scope (Still)
- Any harness that implies multi-provider-first execution.
- Messenger-first bot surfaces or multi-platform chat gateways.
- Budget/HR/org-management simulators.
- Multiplayer workspace or team-first runtime semantics.

## Minimal Integration Contract
Harnesses must:
- live outside the core runtime boundary (`src/execution/*` stays minimal)
- be invoked explicitly, not automatically
- leave evidence in logs or artifacts when used
- be documented in repo source-of-truth files (this doc + decision log)

## Concrete Local Tooling (Now)
### `scripts/markitdown-convert.mjs`
Wrapper for optional local `markitdown` CLI usage:
- converts a document into markdown for later inspection
- refuses to run if `markitdown` is not installed
- does not change runtime behavior or UI

## Verification
Use:
- `node --check scripts/markitdown-convert.mjs`
- `node scripts/smoke-harness-slice-01.mjs`
