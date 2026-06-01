# V1 Planned Feature Completion Readiness

## Purpose
This document fixes the current completion baseline for the planned Orchestration feature set.

It is not a new feature plan. It records that the repo-defined V1 and post-v1 company shell baseline
are complete enough to be treated as the current published product baseline, and that any further
implementation must start from a concrete regression, usability issue, or explicit vNext decision.

## Recorded Baseline
- recorded at: `2026-05-26 14:57:53 +0900`
- recorded before this documentation commit
- branch: `main`
- baseline head: `833d2735534609d91546f5fb9a3a7420b33e9f9d`
- baseline short head: `833d273`
- git status: `## main...origin/main`
- local completion: `localDevelopmentComplete=true`
- kickoff readiness: `kickoffReady=true`
- dogfood cleanup: `cleanupCompleted=true`
- implementation gate: `do-not-open-new-implementation-without-a-concrete-regression-or-usability-issue`

This record intentionally allows the documentation commit that contains this file to move `HEAD`.
After that commit, the same completion criteria must stay green on the new head before claiming the
published baseline is still complete.

## Recorded Published Proof Snapshot
The additive readiness documentation commit was published and rechecked without opening any new
runtime, API, UI, provider, dogfood, cleanup, or release behavior.

- verified at: `2026-05-26 15:09:48 +0900`
- recorded proof head: `9f216e6ef4c35fcad60008c1d833877435c4e13a`
- verified short head: `9f216e6`
- git status: `## main...origin/main`
- local completion: `localDevelopmentComplete=true`
- kickoff readiness: `kickoffReady=true`
- dogfood cleanup: `cleanupCompleted=true`
- implementation triage: no concrete regression or usability issue reported
- aggregate verification: `node scripts/verification_status.mjs` passed `12/12` checks
- aggregate count note: `12/12` is the historical count for this recorded proof snapshot; the
  current aggregate count must be read from `node scripts/verification_status.mjs` on the current
  repository head.

This snapshot is a recorded proof point, not a self-referential claim about the commit that edits
this file. The current repository head must still be validated by the status scripts before
close-out. Future commits may supersede this proof point only after the same
completion/status/triage/inventory/aggregate checks pass again on the new head.

## Planned Feature Matrix
| Planned capability | Source of truth | Completion status | Verification anchor |
| --- | --- | --- | --- |
| Local-first, single-user-first, ops-first control plane | `docs/00_master-brief.md`, `docs/03_architecture-roadmap-v1.md` | Complete for current V1 | `node scripts/v1-local-completion-status.mjs` |
| `project_path` required before execution | `docs/00_master-brief.md`, `packs/development/pack.md` | Complete | Required source-of-truth docs plus runtime smoke coverage |
| `Taskboard / Logs / Artifacts / Decision Inbox` advanced-ops surfaces | `docs/02_ia-v1.md`, `docs/00_master-brief.md` | Complete and retained as advanced ops mode | `node scripts/smoke-v1-user-flow-kickoff.mjs` |
| `Mission / Council / Execution / Deliverables` primary shell | `docs/06_ai-orchestration-pivot.md`, `DESIGN.md` | Complete on current `main` as the post-v1 shell baseline | `node scripts/v1-kickoff-evidence-triage.mjs` |
| Development pack stage loop through reviewer | `packs/development/pack.md`, `docs/03_architecture-roadmap-v1.md` | Complete for `planner -> architect -> task-breaker -> builder-preflight -> builder-live-mutation -> reviewer` | `node scripts/verification_status.mjs` |
| Review before done and approval before commit | `AGENTS.md`, `packs/development/pack.md`, `docs/01_decision-log.md` | Complete and still non-negotiable | `node scripts/smoke-v1-user-flow-kickoff.mjs` |
| Review-passed Deliverables routing | `tasks/lessons.md`, `ui/app.js` | Complete; `review.status=passed` routes the result packet to `Deliverables` and must not be confused with `approval.status=approved` | `node scripts/smoke-ui-slice-638.mjs` inside `node scripts/verification_status.mjs` |
| Downstream local follow-up boundary | `docs/03_architecture-roadmap-v1.md`, `packs/development/pack.md` | Complete as explicit local follow-up only | Current docs and status scripts |
| Live provider boundary | `docs/01_decision-log.md`, `docs/03_architecture-roadmap-v1.md` | Complete at `openai-responses` planner-through-reviewer opt-in | Provider synthetic checks inside `node scripts/verification_status.mjs` |
| Harness-first posture and Hermes internal composition | `docs/13_harness-baseline.md` | Complete for repo-native harness governance and internal Hermes-style loop mapping | `node scripts/harness_verification_status.mjs` and `node scripts/hermes-agent-internal-harness-status.mjs` |
| Dogfood lifecycle and cleanup evidence | `docs/16_v1-dogfood-triage.md`, `docs/15_v1-start-runbook.md` | Complete through Dogfood Run 121 cleanup | `node scripts/v1-dogfood-evidence-inventory.mjs` |
| Issue-driven implementation entry gate | `docs/15_v1-start-runbook.md`, `docs/04_codex-handoff-master-brief.md` | Complete; no new slice opens without a concrete issue | `node scripts/v1-kickoff-evidence-triage.mjs` |

## Current Completion Criteria
The planned feature baseline is complete only while all of these are true:

1. `git status --short --branch` reports clean `main` against `origin/main`, or a future local commit
   is explicitly waiting for publish approval.
2. `node scripts/v1-local-completion-status.mjs` reports `localDevelopmentComplete=true`.
3. `node scripts/v1-kickoff-status.mjs` reports `kickoffReady=true`.
4. `node scripts/v1-kickoff-evidence-triage.mjs` reports no concrete regression or usability issue.
5. `node scripts/v1-dogfood-evidence-inventory.mjs` reports `cleanupCompleted=true` and
   `cleanupBlockedUntilApproval=false`.
6. `node scripts/verification_status.mjs` passes required checks and informational completion gates.
7. `node scripts/ui_qa_status.mjs` and `node scripts/smoke-v1-user-flow-kickoff.mjs` pass on the
   current head before UI shell, advanced-ops, or first user-flow completion proof is reused.
8. `node scripts/smoke-ui-slice-638.mjs` remains part of the aggregate verification chain so
   review-passed results continue to route to `Deliverables` instead of falling back to `Execution`.
9. `node scripts/harness_verification_status.mjs` and
   `node scripts/hermes-agent-internal-harness-status.mjs` remain green before any current
   Harness/Hermes completion claim is reused as close-out evidence.

## Non-Blocking Follow-Up
The following remain valid follow-up lanes, but they do not block the planned feature completion
baseline:

- optional real-live provider reruns when `OPENAI_API_KEY` and `OPENAI_RESPONSES_MODEL` are visible
  to the current execution context
- another intentional `run-another-dogfood-execute` pass, only after explicit approval and with
  retained-evidence plus cleanup lifecycle closed again
- future vNext feature expansion, only after a new decision updates source-of-truth docs
- additional harness consumers, only when they preserve the frozen harness producer contracts

## Stop Conditions For New Work
Do not open a new implementation slice from this baseline unless at least one condition is true:

- `v1-kickoff-evidence-triage` reports a concrete regression or usability issue
- a verification script fails for a repo-side reason
- source-of-truth docs conflict with implemented behavior
- the user explicitly opens a vNext scope decision that changes the current baseline

If none of these are true, the correct default is to keep the current baseline clean and published
instead of running another dogfood loop or adding another feature.
