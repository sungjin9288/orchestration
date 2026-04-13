# Orchestration 1.0 Repository Rules

## Purpose
Build Orchestration 1.0 as a local-first, single-user-first, ops-first control plane.

## Codex Operating Rules

### Default Flow
- Start non-trivial work with `$repo-intake`.
- Follow `$orchestration-freeze-gate` for runtime, UI, docs, tasks, smoke slices, and any change that can widen scope or alter baseline behavior.
- Finish with `$verify-gate` before close-out.
- Use `$task-ledger-sync` when `tasks/todo.md` or `tasks/lessons.md` should change as part of the work.
- Do not use `$release-evidence` by default; add it only when the task explicitly refreshes an existing QA, smoke, or handoff artifact flow.

### Source Of Truth
- Keep repo docs, `DESIGN.md` when present, and task files as source of truth.
- Preserve the frozen baseline unless the task explicitly widens scope.
- If a new discovery conflicts with the current docs, report the conflict and update docs only when the task scope supports it.

### Skill And MCP Expansion
- Add `$playwright` and Playwright MCP only when a real browser or UI slice needs runtime proof.
- Add `$linear` and Linear MCP only when the task is tied to tracked issue, project, or operations follow-up work.
- Keep optional live-provider verification non-blocking unless the task explicitly targets that boundary.
- If extra skills or MCPs are added, state briefly why they were needed.

### Execution Rules
- Choose the smallest vertical slice that satisfies the task.
- Do not silently change architecture, workflow boundaries, or downstream semantics.
- Distinguish required synthetic gates from optional live-provider reruns in both execution and reporting.
- Record environment visibility and runtime evidence exactly rather than inferring hidden state.

## Non-negotiable Rules
- local-first, single-user-first, ops-first
- source of truth for policy/contracts is repo files
- v1 scope = development pack only
- company/ERP-style shell, visible AI roles, meeting flow, and workday framing are allowed when they preserve execution gates, advanced-ops authority, and local-first operation
- do not introduce messenger-first, ranking, OAuth, multi-provider-first, budget/HR/org-management, or multiplayer workspace semantics
- project_path is required before any execution
- review before done
- approval before commit
- builder must not silently change architecture
- prefer thin-slice / vertical-slice
- propose a plan before multi-file edits
- do not edit files until approval when the task explicitly asks for planning first

## Required Read Order
1. AGENTS.md
2. docs/00_master-brief.md
3. docs/01_decision-log.md
4. docs/02_ia-v1.md
5. docs/03_architecture-roadmap-v1.md
6. packs/development/pack.md
7. tasks/todo.md
8. tasks/lessons.md

When UI shell/design work is in scope, also read `DESIGN.md` after the required docs.

## Required Output Format
- changed files
- why
- commands run
- test/check results
- remaining [OPEN]
