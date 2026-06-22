# Contribution Scope Note

## Status

- Date: 2026-06-22
- Purpose: portfolio, resume, and interview answers should separate repo-backed contribution claims from broader product claims that still need evidence.
- Boundary: this note is a repository evidence guide. It does not prove employment context, team ownership, hosted availability, commercial usage, or user outcomes.

## Safely Explain With Code Evidence

The following areas can be explained from committed repository files and current local evidence.

| Area | What can be explained | Evidence |
|---|---|---|
| Runtime state model | project, mission, task, run, artifact, review, approval, and decision state are represented in a local-first runtime | `src/runtime/runtime-service.js`, `src/runtime/contracts.js` |
| File persistence | state, JSONL logs, and artifacts persist through local file-backed storage | `src/runtime/file-store.js` |
| Execution coordinator | development pack stages are coordinated from planner through reviewer and local follow-up steps | `src/execution/execution-coordinator.js`, `packs/development/pack.md` |
| Provider boundary | default `local-stub` execution and opt-in `openai-responses` execution are separated behind an adapter contract | `src/execution/provider-adapter.js`, `src/execution/providers/local-stub-adapter.js`, `src/execution/providers/openai-responses-adapter.js` |
| Local UI/API server | static UI actions are routed through a Node.js local HTTP server and refreshed through `/api/snapshot` | `scripts/serve-ui-slice-01.mjs` |
| Shell UI | Mission, Council, Execution, Deliverables, Taskboard, Logs, Artifacts, and Decision Inbox surfaces are implemented in static UI files | `ui/index.html`, `ui/app.js`, `ui/styles.css` |
| Workflow policy | local-first, single-user-first, ops-first boundaries are documented as source-of-truth project rules | `AGENTS.md`, `docs/00_master-brief.md`, `docs/01_decision-log.md`, `docs/03_architecture-roadmap-v1.md` |
| Portfolio evidence | README, case study, screenshots, screencast path, evidence manifest, and local package handoff are tied together for reviewer context | `README.md`, `docs/case-study.md`, `evidence/evidence_manifest.md`, `docs/portfolio-share-handoff.md` |

## Claim Only With Caveat

Use these only when the caveat is included.

| Topic | Safe caveat |
|---|---|
| OpenAI live role execution | The adapter and opt-in boundary are implemented, but the latest visible session recorded `skipped_missing_env` in `docs/live-provider-verification-note.md`. Treat pass/fail live evidence as open until a configured environment rerun is recorded. |
| Shareable demo | A local screencast and local package exist, but there is no verified reviewer-facing URL yet. Do not add a Demo URL until access is checked outside the owner session. |
| Growth gateway and self-improvement | Current work is read-only status contract oriented. Do not describe it as a broad autonomous improvement platform. |
| Portfolio project status | It is acceptable to describe this as a personal PoC with local evidence. Do not imply public service usage, customer adoption, or measured outcome data. |

## Do Not Claim

- User count, adoption metrics, cost reduction, accuracy, or other outcome numbers without measurement evidence.
- Hosted deployment or public URL access before a reviewer-facing link is verified.
- Multi-user auth, multiplayer workspace, OAuth-first platform behavior, budget/HR/org-management simulation, or broad provider marketplace behavior.
- Automatic external push, publish, merge, or release behavior; the repo keeps those steps as explicit local follow-up or human-gated boundaries.
- Commercial service operation, customer delivery, or team ownership unless separate non-repo evidence is available.

## Interview Answer Template

Short answer:

> I can explain the local runtime, execution coordinator, provider adapter boundary, UI/API server, static shell UI, and verification docs because those are backed by repository files. The external share URL and configured OpenAI live pass/fail evidence are still open, so I describe those as pending verification rather than completed outcomes.

Longer answer:

> My direct technical explanation should stay anchored to `src/runtime/*`, `src/execution/*`, `scripts/serve-ui-slice-01.mjs`, and `ui/*`. For product scope, I use `AGENTS.md`, the master brief, decision log, architecture roadmap, and development pack as the source of truth. I avoid claims about user adoption, hosted availability, or broad platform behavior because the repo does not contain evidence for those.

## Evidence Checklist Before External Sharing

- Run `node scripts/verification_status.mjs` and keep the required/informational gate result visible in close-out notes.
- Keep `docs/live-provider-verification-note.md` current when optional live-provider checks are skipped or rerun.
- Verify the local package checksum in `docs/portfolio-share-handoff.md` after any package content change.
- Confirm `links.md` does not contain a Demo URL until reviewer access is verified.
- Keep resume bullets limited to code-backed areas and caveated live-provider/shareable-demo claims.
