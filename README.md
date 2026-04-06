# Orchestration

Local-first personal AI agent control plane for two bounded work modes:
- `development`: coding, repo mutation, tests, review, gated commit flow
- `knowledge-work`: decisions, plans, PRDs, one-pagers, checklists, grounded documentation

## What This Repo Now Supports
- `Mission -> Council -> Execution -> Deliverables` primary shell
- project-scoped pack selection at registration time
- mission-scoped deliverable type selection for `knowledge-work`
- visible multi-role alignment before downstream execution
- same provenance model for runs, artifacts, review, approval, and decisions across both packs
- explicit human gates before risky downstream steps
- optional `openai-responses` live path now supports knowledge-work PRD generation from a missing target file baseline and reviewer rubric enforcement for bounded deliverables
- repo-native aggregate smoke for knowledge-work live-provider coverage: `node scripts/smoke-provider-knowledge-work.mjs`
- repo-native pack-level smoke for knowledge-work runtime plus live-provider coverage: `node scripts/smoke-knowledge-work-pack.mjs`
- repo-native verification status entrypoint: `node scripts/verification_status.mjs`

## Why The New Pack Matters
The original runtime was strong for coding work, but weak for broader 업무 support.  
The `knowledge-work` pack keeps the same control-plane semantics while letting the agent produce and review decision aids, planning artifacts, and documentation without pretending everything is a code change.

Current deliverable types:
- `decision-memo`
- `prd`
- `execution-plan`
- `checklist`
- `research-brief`

Knowledge-work live-provider smoke bundle:
- `node scripts/smoke-provider-knowledge-work.mjs`
- includes `scripts/smoke-provider-slice-08.mjs` through `scripts/smoke-provider-slice-12.mjs`

Knowledge-work pack smoke bundle:
- `node scripts/smoke-knowledge-work-pack.mjs`
- includes `scripts/smoke-runtime-slice-07.mjs`, `scripts/smoke-runtime-slice-08.mjs`, `scripts/smoke-runtime-slice-09.mjs`, and `scripts/smoke-provider-knowledge-work.mjs`

Top-level verification status:
- `node scripts/verification_status.mjs`
- `node scripts/verification_status.mjs --include-on-demand`
- deterministic status smoke: `node scripts/smoke-verification-status-slice-01.mjs`
- aggregate status-entrypoint smoke: `node scripts/smoke-status-entrypoints.mjs`
- aggregate status-entrypoint smoke with on-demand lane: `node scripts/smoke-status-entrypoints.mjs --include-on-demand`
- current required lane: `scripts/smoke-knowledge-work-pack.mjs`
- current informational lanes: `scripts/ui_qa_status.mjs`, `scripts/smoke-openspace-slice-01.mjs`
- current on-demand bundle surfaced from the same report: `scripts/smoke-qa-browser-pack.mjs`
- `--include-on-demand` executes that browser bundle from the same top-level report; without the flag it remains discoverable but not executed
- if localhost browser harness binding is blocked by the current sandbox, the on-demand lane reports `skipped` instead of a false red

UI QA status:
- `node scripts/ui_qa_status.mjs`
- current required lane: frozen shell plus advanced-ops continuity smokes
- current informational lane: local `http://127.0.0.1:4315/api/snapshot` reachability when the UI server is running
- if no local UI server is running, the snapshot lane reports `skipped` instead of turning the whole status surface red

Optional browser QA bundle:
- `node scripts/smoke-qa-browser-pack.mjs`
- includes `scripts/smoke-qa-slice-01.mjs`, `scripts/smoke-qa-slice-02.mjs`, `scripts/smoke-qa-slice-04.mjs`, `scripts/smoke-qa-slice-05.mjs`, `scripts/smoke-qa-slice-06.mjs`, and `scripts/smoke-qa-slice-07.mjs`
- remains separate from the blocking verification lane so the required shell and pack status stay fast and stable while longer Playwright coverage is still reproducible on demand

## Core Objects
- `Project`: registered local path plus selected pack
- `Mission`: top-level goal
- `Council Session`: visible role alignment
- `Task`: bounded execution unit
- `Run`: concrete execution attempt
- `Artifact`: retained output or evidence
- `Decision / Approval / Review`: human-visible gate objects

## Key Files
- `AGENTS.md`
- `packs/development/pack.md`
- `packs/knowledge-work/pack.md`
- `src/runtime/runtime-service.js`
- `src/execution/execution-coordinator.js`
- `ui/app.js`

## Run
```bash
node scripts/serve-ui-slice-01.mjs --port 4173 --runtime-root ./var/local-ui
```

Then open `http://127.0.0.1:4173`, register a local project, choose `development` or `knowledge-work`, and start from `Mission`.

## OpenSpace Integration

- plan and guardrails: `docs/08_openspace-integration-plan.md`
- repo-local smoke: `node scripts/smoke-openspace-slice-01.mjs`
- current expectation: local skill discovery and MCP wiring should pass; end-to-end `execute_task` may still be blocked or time out depending on host-side LLM auth/session exposure
