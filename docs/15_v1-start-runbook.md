# V1 Start Runbook

## Purpose
This document defines the handoff from development closeout into v1 start.

It does not stage, commit, push, publish, merge, or widen runtime behavior. It exists so the
operator can decide whether the current local `main` is ready for v1 dogfooding and what must
be checked before the first real v1 run.

## Current Status
- Frozen v1 control-plane baseline is complete on current `main`.
- Post-v1 primary shell baseline `Mission / Council / Execution / Deliverables` is implemented.
- Preview-only repo-content redaction for `change-summary` structured preview is already implemented; raw artifacts remain the source of truth.
- `Taskboard / Logs / Artifacts / Decision Inbox` remain the authoritative advanced-ops surfaces.
- Local `main` may be ahead of `origin/main`; push remains a separate approval-sensitive action.
- OpenSpace repo wiring and skill discovery are green, but `execute_task` can remain blocked by host LLM credentials.

## Start Definition
V1 start is allowed when all of the following are true:

1. The working tree is clean.
2. Required synthetic gates pass.
3. Representative browser/runtime smoke passes.
4. No local runtime listener remains after smoke execution.
5. Any live-provider or OpenSpace red is classified as external host/env condition, not repo regression.
6. Push has either been explicitly approved or intentionally deferred.

## Required Local Gate
Run these before declaring v1 start readiness:

```sh
git status --short --branch
git diff --check
node scripts/ui_qa_status.mjs
node scripts/harness_verification_status.mjs
node scripts/verification_status.mjs
node scripts/smoke-qa-slice-07.mjs
lsof -iTCP -sTCP:LISTEN -n -P | rg 'runtime-qa-slice-07|59006|4315' || true
```

Expected result:
- `git status` shows a clean tree except the known ahead count when push is deferred.
- `ui_qa_status` passes all required checks; snapshot reachability may be informational skipped when the UI server is off.
- `harness_verification_status` passes all required harness checks.
- `verification_status` passes required checks and informational OpenSpace lanes.
- `smoke-qa-slice-07` passes project registration, mission/task setup, builder approval/run, artifacts/logs, reviewer run, duplicate guards, and secret scan.
- listener check returns no relevant runtime listener.

## Latest Local Readiness Evidence
Recorded at `2026-04-29 01:21:17 +0900` on local `main`.

This evidence was collected before this readiness-record documentation update. The gate head was
`88819f9a859f97624f0f64569b05b9a7742682ec`.

- branch: `main`
- repo status: clean tree with `main...origin/main [ahead 7]`
- project_path: `/Users/sungjin/dev/personal/orchestration`
- required gate result: pass
- `git diff --check`: pass
- `node scripts/ui_qa_status.mjs`: pass, `16/16` required checks; snapshot reachability skipped because the local UI server was off
- `node scripts/harness_verification_status.mjs`: pass, `44/44` checks
- `node scripts/verification_status.mjs`: pass, required `knowledge-work-pack` plus informational OpenSpace and v1 runbook lanes
- `node scripts/smoke-qa-slice-07.mjs`: pass
- runtimeRoot: `/Users/sungjin/dev/personal/orchestration/var/runtime-qa-slice-07`
- outputRoot: `/Users/sungjin/dev/personal/orchestration/output/playwright/qa-slice-07`
- key run ids: `run-0005` builder, `run-0006` reviewer
- key artifact ids: `artifact-0005` change summary, `artifact-0006` patch, `artifact-0007` diff, `artifact-0008` review
- approval/review state: `approval-0001`, builder/reviewer readiness `ready`
- listener check: no `runtime-qa-slice-07`, `59006`, or `4315` listener remained
- push state: deferred; no push was performed
- follow-up: start `v1 dogfood result triage` with a real local task, then fix only the highest-severity local-first workflow regression found

## Post-Dogfood Local Handoff Evidence
Recorded at `2026-04-29 16:34:42 +0900` on local `main`.

This evidence was collected before this post-dogfood handoff documentation update. The handoff head was
`5f8f4778aa22d2a94ccc569628f96487e3a4918f`.

- branch: `main`
- repo status: clean tree with `main...origin/main [ahead 14]`
- project_path: `/Users/sungjin/dev/personal/orchestration`
- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 004` recorded
- dogfood runner status: `scripts/v1-dogfood-linked-worktree-runner.mjs` defaults to `--dry-run`; execute mode requires explicit `--execute --slug <slug>`
- dogfood self-execute result: `Dogfood Run 004` passed through linked worktree creation, approval consumption, builder live mutation, reviewer, and artifact bundle capture
- retained evidence inventory: `node scripts/v1-dogfood-evidence-inventory.mjs` returned `ok=true`
- retained linked worktrees: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-run-002`, `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-001`
- retained linked worktree status: both are dirty by design with `prompts/builder.md` marker mutation
- cleanup state: destructive cleanup remains blocked until explicit operator approval
- `node scripts/verification_status.mjs`: pass, `1/1` required checks and `7/7` informational checks
- push state: deferred; no push was performed
- follow-up: choose between explicit cleanup approval for retained dogfood worktrees, another intentional `--execute --slug <slug>` dogfood run, or push approval when local development is ready to publish

## Operator Decision Status
Use `node scripts/v1-operator-status.mjs` when the next action is unclear after post-dogfood handoff.

The command produces a read-only status summary for:
- current `main` clean/dirty state, head, and ahead count
- `node scripts/verification_status.mjs` aggregate status
- retained dogfood evidence inventory and cleanup approval state
- operator choices for deferring push, pushing `main`, cleaning retained dogfood worktrees, or running another execute-mode dogfood slug

Safety boundary:
- the script does not push, remove worktrees, delete branches, execute dogfood, commit, merge, release, or close out
- `push-main`, `cleanup-retained-dogfood-worktrees`, and `run-another-dogfood-execute` remain explicit operator approval decisions
- default safe action remains to defer push until the operator explicitly chooses push, retained dogfood cleanup, or another execute dogfood slug

## Optional Live Rehearsal
Optional live checks remain non-blocking for v1 start unless the task explicitly targets live-provider readiness.

Before live rehearsal, confirm host env visibility:

```sh
launchctl getenv OPENAI_API_KEY
launchctl getenv OPENAI_RESPONSES_MODEL
```

Then run:

```sh
node scripts/smoke-provider-live-slice-05.mjs
node scripts/smoke-qa-live-slice-07.mjs
```

If env values are missing or provider auth/quota fails, record the exact blocker and keep it separate from repo readiness.

## OpenSpace Boundary
OpenSpace is v1-supporting infrastructure, not a v1 start blocker by itself.

- `scripts/smoke-openspace-slice-01.mjs` should confirm repo wiring and local skill discovery.
- `scripts/smoke-openspace-slice-02.mjs` should confirm the integration doc boundary.
- `scripts/smoke-openspace-slice-03.mjs` should confirm repo-local skills separate discovery readiness from `execute_task` host credential readiness.
- `blocked_missing_host_llm_credentials` is a host follow-up, not repo wiring regression.

## First V1 Dogfood Scenario
Use the current local project as the first dogfood target unless a different local repo is explicitly selected.

Scenario:
1. Register or select a real local project.
2. Create one small development task with a concrete outcome.
3. Run `Mission -> Council -> Execution -> Deliverables`.
4. Confirm the advanced-ops handoff can show the same work through `Taskboard / Logs / Artifacts / Decision Inbox`.
5. Stop before push, publish, merge, or external release unless explicitly approved.

Evidence to record:

```md
- date:
- branch:
- head:
- project_path:
- command:
- result: pass | fail | skipped
- runtimeRoot:
- outputRoot:
- key run ids:
- key artifact ids:
- approval/review state:
- operator friction:
- follow-up:
```

## Stop Criteria
Do not start v1 dogfooding if any of these are true:

- local synthetic required gate fails
- `smoke-qa-slice-07` fails for a repo-side reason
- worktree is dirty from unclassified changes
- runtime listener remains after smoke execution
- the user-facing flow does not explain current action, result location, or next destination

## Next Development Priority
After v1 start readiness is recorded, the next development priority is v1 dogfood result triage.

Default next action:
- run one real local development task through `Mission -> Council -> Execution -> Deliverables`
- record operator friction, artifact/review/approval evidence, and any stop criteria hit
- fix only the highest-severity local-first workflow regression found by that run

Do not reopen the already-completed preview-only artifact redaction policy unless dogfood exposes a concrete redaction regression.
