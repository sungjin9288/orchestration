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
- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 005` recorded
- dogfood runner status: `scripts/v1-dogfood-linked-worktree-runner.mjs` defaults to `--dry-run`; execute mode requires explicit `--execute --slug <slug>`
- dogfood self-execute result: `Dogfood Run 004` passed through linked worktree creation, approval consumption, builder live mutation, reviewer, and artifact bundle capture
- retained evidence inventory: `node scripts/v1-dogfood-evidence-inventory.mjs` returned `ok=true`
- retained linked worktrees: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-run-002`, `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-001`
- retained linked worktree status: both are dirty by design with `prompts/builder.md` marker mutation
- cleanup state: Dogfood Run 002, Run 004, and Run 005 cleanup was completed after explicit operator approval
- `node scripts/verification_status.mjs`: pass, `1/1` required checks and `7/7` informational checks
- push state: deferred; no push was performed
- follow-up: push and retained dogfood cleanup were completed; any further intentional `--execute --slug <slug>` dogfood run requires explicit approval

## Additional Dogfood Execute Evidence
Recorded at `2026-04-30 10:49:50 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 006` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-003`
- source head: `175403dcc165cb4b8750ec60b14eace637a56912`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-003`
- retained linked worktree status: cleaned up after explicit destructive approval
- cleanup state: Dogfood Run 006 retained linked worktree cleanup has completed
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

## Additional Dogfood Execute Evidence
Recorded at `2026-04-30 20:39:45 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 007` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-004`
- source head: `3498832bc1a17c13568bcffe074e47485982f20e`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-004`
- retained linked worktree status: cleaned up after explicit destructive approval
- cleanup state: Dogfood Run 007 retained linked worktree cleanup has completed
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

## Additional Dogfood Execute Evidence
Recorded at `2026-04-30 23:00:37 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 008` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-005`
- source head: `68d235db5066b11e6ef1805e0210f4f3d52f4035`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-005`
- retained linked worktree status: cleaned up after explicit destructive approval
- cleanup state: Dogfood Run 008 retained linked worktree cleanup has completed
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

## Additional Dogfood Execute Evidence
Recorded at `2026-05-01 00:24:18 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 009` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-006`
- source head: `895d945fe9d8810436b396e791a5ae8bed8c7675`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-006`
- retained linked worktree status: cleaned up after explicit destructive approval
- cleanup state: Dogfood Run 009 retained linked worktree cleanup has completed
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

## Additional Dogfood Execute Evidence
Recorded at `2026-05-01 00:59:49 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 010` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-007`
- source head: `4b9a8f97a86bc7adba743046af8fa25f25a146a9`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-007`
- retained linked worktree status: cleaned up after explicit destructive approval
- cleanup state: Dogfood Run 010 retained linked worktree cleanup has completed
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

## Additional Dogfood Execute Evidence
Recorded at `2026-05-01 11:23:26 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 011` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-008`
- source head: `939eb695a9c6342cb6148071662ffc8bc10fec1c`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-008`
- retained linked worktree status: cleaned up after explicit destructive approval
- cleanup state: Dogfood Run 011 retained linked worktree cleanup has completed
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

## Additional Dogfood Execute Evidence
Recorded at `2026-05-01 12:17:35 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 012` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-009`
- source head: `4d93430291fa8643d14937dd9b76e57df802b029`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-009`
- retained linked worktree status: cleaned up after explicit destructive approval
- cleanup state: Dogfood Run 012 retained linked worktree cleanup has completed
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

## Additional Dogfood Execute Evidence
Recorded at `2026-05-01 17:46:18 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 013` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-010`
- source head: `ba27bea351353e179fb5f1e4f8fcafb889bb310b`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-010`
- retained linked worktree status: cleaned up after explicit destructive approval
- cleanup state: Dogfood Run 013 retained linked worktree cleanup has completed
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

## Operator Decision Status
Use `node scripts/v1-operator-status.mjs` when the next action is unclear after post-dogfood handoff.

The command produces a read-only status summary for:
- current `main` clean/dirty state, head, and ahead count
- `node scripts/verification_status.mjs` aggregate status
- retained dogfood evidence inventory and cleanup completion state
- operator choices for deferring push or running another execute-mode dogfood slug

Safety boundary:
- the script does not push, remove worktrees, delete branches, execute dogfood, commit, merge, release, or close out
- retained dogfood cleanup can be either completed or currently blocked behind explicit cleanup approval; `run-another-dogfood-execute` remains a separate explicit operator approval decision
- `verification_status` is serialized through `var/locks/verification_status.lock`, so nested status checks do not run shared smoke runtime roots concurrently
- default safe action remains to defer new execution unless the operator explicitly chooses another execute dogfood slug

Manual concurrency regression check:
- run `node scripts/smoke-verification-status-lock-concurrency.mjs` when changing `verification_status` locking or `v1-operator-status` nested verification behavior
- keep this smoke standalone; do not add it to `scripts/verification_status.mjs`, because it intentionally spawns concurrent `verification_status` children to prove lock serialization

## Local Completion Status
Use `node scripts/v1-local-completion-status.mjs` to summarize whether current local development is complete, retained-evidence commit or cleanup approval is pending, and retained cleanup is either complete or approval-blocked.

The command reports `localDevelopmentComplete=true` only when:
- current `main` is clean
- `verification_status` is green
- retained dogfood evidence inventory is green
- push is complete or, before publish, available but still pending explicit approval
- retained dogfood cleanup is complete or currently blocked behind explicit approval

Safety boundary:
- the script is read-only
- it does not push, clean worktrees, execute dogfood, commit, merge, release, or close out
- `defer-push` remains the no-op next action listed as allowed without approval

## V1 Kickoff Status
Use `node scripts/v1-kickoff-status.mjs` after local completion is green and dogfood cleanup is complete.

The command is read-only and exists to prevent the project from looping on additional dogfood by default.

It reports the first v1 kickoff slice as ready only when:
- local development is complete
- current `main` is published
- verification is green
- retained dogfood cleanup is complete
- no approval-gated blocker remains except optional additional execute-mode dogfood

First v1 kickoff slice:
- Register or select a local project.
- Create one small development task with a concrete operator-facing outcome.
- Run the work through `Mission / Council / Execution / Deliverables`.
- Confirm `Taskboard / Logs / Artifacts / Decision Inbox` still show where the result, evidence, approval, and next action live.
- Stop before push, publish, merge, external release, or hidden cleanup unless explicitly approved.

Additional execute-mode dogfood is optional and approval-gated; do not run another dogfood pass by default once the kickoff status is green. Dogfood Run 020 was intentionally run after approval, and its retained linked worktree is preserved as approval-blocked evidence until explicit destructive cleanup approval.

## Additional Dogfood Execute Evidence
Recorded at `2026-05-03 15:48:13 +0900` on published `main`.

- dogfood triage status: `Dogfood Run 001` through `Dogfood Run 020` recorded
- command: `node scripts/v1-dogfood-linked-worktree-runner.mjs --execute --slug v1-dogfood-runner-017`
- source head: `fafd653385c7f1d99884326530d8759a360a1cb4`
- retained linked worktree: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-017`
- retained linked worktree status: retained dirty by design with `prompts/builder.md` marker mutation
- cleanup state: Dogfood Run 020 retained linked worktree cleanup is pending explicit destructive approval
- result: reviewer `pass`, task review status `passed`, no commit-package, local commit, push, merge, release-package, or close-out ran

Runtime/browser proof for the kickoff slice:

```sh
node scripts/smoke-v1-user-flow-kickoff.mjs
```

During development of the kickoff smoke itself, `V1_KICKOFF_ALLOW_DIRTY=1` may be used only when the sole blocker is unpublished local source changes from the current slice. Do not use that override as release evidence after the smoke is committed and pushed.

## Clean Published Kickoff Evidence
Recorded at `2026-04-30 00:23:38 +0900` on published `main`.

Repository state:
- head: `23b4a8e464b45a2ad4cdc99eb52c74af3dadc20c`
- repo status: clean tree with `main...origin/main`
- `node scripts/v1-kickoff-status.mjs`: pass, `kickoffReady=true`, `mainPublished=true`, `verificationOk=true`, `cleanupSettled=true`
- `node scripts/ui_qa_status.mjs`: pass, `17/17` required checks; `/api/snapshot` reachability remained informational `skipped` because no local UI server was running

Runtime/browser proof:
- command: `node scripts/smoke-v1-user-flow-kickoff.mjs`
- result: pass without `V1_KICKOFF_ALLOW_DIRTY`
- runtimeRoot: `/Users/sungjin/dev/personal/orchestration/var/runtime-v1-user-flow-kickoff`
- outputRoot: `/Users/sungjin/dev/personal/orchestration/output/playwright/v1-user-flow-kickoff`
- scenario: `task-0001`, approval `approval-0001`, builder `run-0005`, reviewer `run-0006`
- artifacts: `artifact-0005` change summary, `artifact-0006` patch, `artifact-0007` diff, `artifact-0008` review
- surfaces verified: `Mission`, `Council`, `Execution`, `Deliverables`, `Taskboard`, `Logs`, `Artifacts`, `Decision Inbox`
- safety boundary: no commit, push, merge, release, or external release was executed

Resulting default posture:
- the first v1 user-flow kickoff smoke is now verified on clean/published `main`
- do not rerun execute-mode dogfood by default
- next implementation should be driven by a concrete regression or usability issue found from this evidence, not by reopening completed v1 readiness work

Use `node scripts/v1-kickoff-evidence-triage.mjs` to summarize the clean proof, retained runtime/output evidence, and implementation gate. The command is read-only and should return `do-not-open-new-implementation-without-a-concrete-regression-or-usability-issue` when no concrete issue is detected.

If the working tree is dirty because a new documentation or triage slice is in progress, current `kickoffReady` may be false while the recorded clean/published proof remains valid. Treat that as an in-progress source state, not a kickoff regression, when `cleanPublishedProofRecorded=true` and retained evidence files are present.

Default post-proof rule:
- do not open a new implementation slice without a concrete regression or usability issue
- keep optional execute-mode dogfood separate and approval-gated
- treat missing runtime/output evidence as an evidence-recording issue, not as permission to widen runtime behavior

## Current Head Kickoff Rerun Evidence
Recorded at `2026-04-30 22:09:09 +0900` on published `main` before this evidence-sync update.

Repository state:
- head: `37a82e5e54db0733512eb26429f25ca1abdc2b50`
- repo status: clean tree with `main...origin/main`
- `node scripts/v1-kickoff-status.mjs`: pass, `kickoffReady=true`, `mainPublished=true`, `verificationOk=true`, `cleanupSettled=true`

Runtime/browser proof:
- command: `node scripts/smoke-v1-user-flow-kickoff.mjs`
- result: pass without `V1_KICKOFF_ALLOW_DIRTY`
- runtimeRoot: `/Users/sungjin/dev/personal/orchestration/var/runtime-v1-user-flow-kickoff`
- outputRoot: `/Users/sungjin/dev/personal/orchestration/output/playwright/v1-user-flow-kickoff`
- scenario: `task-0001`, approval `approval-0001`, builder `run-0005`, reviewer `run-0006`
- artifacts: `artifact-0005` change summary, `artifact-0006` patch, `artifact-0007` diff, `artifact-0008` review
- surfaces verified: `Mission`, `Council`, `Execution`, `Deliverables`, `Taskboard`, `Logs`, `Artifacts`, `Decision Inbox`
- safety boundary: no commit, push, merge, release, or external release was executed

Evidence-sync follow-up:
- `node scripts/ui_qa_status.mjs` initially exposed a stale source-only expectation in `scripts/smoke-ui-slice-634.mjs`: the source-of-truth harness doc already records 45 harness checks, while the UI QA doc-smoke still expected 44.
- this follow-up updates that smoke expectation to the existing 45-check harness aggregate and restores `node scripts/ui_qa_status.mjs` to `17/17` required checks.

## Published Head Kickoff Proof After Evidence Sync
Recorded at `2026-04-30 22:36:59 +0900` on published `main` after the evidence-sync update was committed and pushed.

Repository state:
- head: `eae6513170730728c713ce2d8ba63a584a35769c`
- repo status: clean tree with `main...origin/main`
- `node scripts/v1-kickoff-status.mjs`: pass, `kickoffReady=true`, `mainPublished=true`, `verificationOk=true`, `cleanupSettled=true`

Runtime/browser proof:
- command: `node scripts/smoke-v1-user-flow-kickoff.mjs`
- result: pass without `V1_KICKOFF_ALLOW_DIRTY`
- runtimeRoot: `/Users/sungjin/dev/personal/orchestration/var/runtime-v1-user-flow-kickoff`
- outputRoot: `/Users/sungjin/dev/personal/orchestration/output/playwright/v1-user-flow-kickoff`
- scenario: `task-0001`, approval `approval-0001`, builder `run-0005`, reviewer `run-0006`
- artifacts: `artifact-0005` change summary, `artifact-0006` patch, `artifact-0007` diff, `artifact-0008` review
- surfaces verified: `Mission`, `Council`, `Execution`, `Deliverables`, `Taskboard`, `Logs`, `Artifacts`, `Decision Inbox`
- safety boundary: no commit, push, merge, release, or external release was executed

Evidence-sync result:
- current published head now has the same clean kickoff runtime/browser proof as the earlier current-head rerun
- no concrete regression or usability issue was detected by this proof
- do not open a new implementation slice without a concrete regression or usability issue

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
V1 dogfood result triage has been recorded through Dogfood Run 001 through Dogfood Run 020.

Current local completion is now represented by `node scripts/v1-local-completion-status.mjs`.
First v1 kickoff readiness is represented by `node scripts/v1-kickoff-status.mjs`.

Default next action without approval:
- inspect the retained Dogfood Run 020 evidence; only open a new implementation slice for a concrete regression or usability issue
- run `node scripts/v1-kickoff-evidence-triage.mjs` when the next action is unclear
- keep `node scripts/smoke-v1-user-flow-kickoff.mjs` as the representative clean user-flow proof command

Explicit approval-gated next actions:
- commit Dogfood Run 020 retained evidence locally
- clean up Dogfood Run 020 retained linked worktree after retained-evidence commit
- publish the retained evidence to `origin/main`
- run another intentional `--execute --slug <slug>` dogfood pass only after the clean/published baseline is restored

Completed approval-gated actions:
- previous baseline push was complete before Dogfood Run 020 execute
- Dogfood Run 002, Run 004, Run 005, Run 006, Run 007, Run 008, Run 009, Run 010, Run 011, Run 012, Run 013, Run 014, Run 015, Run 016, Run 017, Run 018, and Run 019 retained dogfood linked worktree cleanup is complete

Currently retained evidence:
- Dogfood Run 020 worktree retained: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-runner-017`; branch retained: `worktree/v1-dogfood-runner-017`; expected dirty marker file: `prompts/builder.md`.

Do not reopen the already-completed preview-only artifact redaction policy unless dogfood exposes a concrete redaction regression.
