# V1 Dogfood Triage

## Purpose
Record post-readiness local dogfood results without widening runtime behavior.

This document does not stage, commit, push, publish, or merge. It captures the evidence needed
to decide the next v1 dogfood triage step and records whether an operator-approved mutation
was intentionally executed inside an isolated linked worktree.

## Dogfood Run 001
Recorded at `2026-04-29 01:30:41 +0900` on local `main`.

- head: `635878f6c95eadfd14c97885a94f3445c044789e`
- project_path: `/Users/sungjin/dev/personal/orchestration`
- provider mode: `local-stub`
- runtimeRoot: `/Users/sungjin/dev/personal/orchestration/var/runtime-v1-dogfood-triage`
- command: temporary API dogfood runner against `scripts/serve-ui-slice-01.mjs`
- result: pass
- listener cleanup: no `runtime-v1-dogfood-triage`, `50536`, `4315`, or `59006` listener remained
- git status after run: clean tree with `main...origin/main [ahead 8]`
- push state: deferred; no push was performed

Scenario executed:
1. Registered the current Orchestration repo as the active local project.
2. Created mission `mission-0001` with autodrafted council session `councilSession-0001`.
3. Approved the council recommendation to run the local-stub auto-chain.
4. Auto-chain created linked task `task-0001` and stopped at `request-builder-live-mutation-approval`.
5. Confirmed the task is `In Progress` with `waitingApproval=true`, `waitingDecision=false`, and `blocked=false`.

Evidence:
- run roles: `planner`, `architect`, `task-breaker`, `builder:preflight`
- artifact types: `plan`, `architecture`, `breakdown`, `preflight`
- approval: `approval-0001`
- pending decision inbox item: `decisionInboxItem-0001`
- builder live mutation approval request: already consumed/blocked from duplicate request after approval creation
- builder live mutation: blocked until explicit approval
- reviewer: blocked until successful builder live mutation

Triage finding:
- Product flow passed through `Mission -> Council -> Execution preflight -> Decision Inbox approval` and produced the expected advanced-ops evidence.
- No repo file was changed by the dogfood run.
- No runtime listener remained after the run.
- The only friction observed was test/operator interpretation: preflight is stored as `role=builder` with `executionMode=preflight`, not as a separate `builder-preflight` role. This is not a product regression.

Next action:
- Continue v1 dogfood with an explicit operator-approved builder live mutation in an isolated linked worktree before touching current `main`.
- If this API-level dogfood path is repeated, convert the temporary runner into a repo-native smoke or dogfood script before relying on it as a regular gate.

## Dogfood Run 002
Recorded at `2026-04-29 15:42:02 +0900` on local `main`.

- head: `fa326814442b01c74b3ead245209857c8b8da109`
- source project_path: `/Users/sungjin/dev/personal/orchestration`
- linked worktree branch: `worktree/v1-dogfood-run-002`
- linked worktree path: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-run-002`
- provider mode: `local-stub`
- runtimeRoot: `/Users/sungjin/dev/personal/orchestration/var/runtime-v1-dogfood-run-002`
- command: temporary API dogfood runner against `scripts/serve-ui-slice-01.mjs`
- result: pass
- listener cleanup: no `runtime-v1-dogfood-run-002`, `59138`, `4315`, or `59006` listener remained
- source git status after run: clean tree with `main...origin/main [ahead 9]`
- linked worktree status after run: dirty by design, `prompts/builder.md` modified
- push state: deferred; no push was performed
- commit state: no commit was performed

Scenario executed:
1. Registered the current Orchestration repo as the root project.
2. Created linked worktree `worktree/v1-dogfood-run-002`, which selected linked project `project-0002`.
3. Created mission `mission-0001` with autodrafted council session `councilSession-0001` inside the linked project.
4. Approved the council recommendation and confirmed the auto-chain stopped at `request-builder-live-mutation-approval`.
5. Approved pending approval `approval-0001` through `decisionInboxItem-0001`.
6. Ran builder live mutation in the linked worktree only.

Evidence:
- task: `task-0001`
- run roles: `planner`, `architect`, `task-breaker`, `builder:preflight`, `builder:live-mutation`
- artifact types: `plan`, `architecture`, `breakdown`, `preflight`, `change-summary`, `patch`, `diff`
- builder live mutation run: `run-0005`
- builder live mutation artifacts: `artifact-0005` change-summary, `artifact-0006` patch, `artifact-0007` diff
- changed files: `prompts/builder.md`
- approval: `approval-0001`, status `approved`, consumed by `run-0005`
- pending inbox items after mutation: none
- next stage: `reviewer`

Linked worktree diff:

```diff
diff --git a/prompts/builder.md b/prompts/builder.md
index aedcc3d..d9fe367 100644
--- a/prompts/builder.md
+++ b/prompts/builder.md
@@ -134,3 +134,4 @@ Do not run reviewer live, commit, merge, release, or advance task lifecycle from
   - no reviewer, commit, merge, or release action ran
 - No unapproved architecture change was made
 - The work is ready for review-facing inspection, not marked complete
+<!-- builder-live-mutation approval-0001 prompts/builder.md -->
```

Triage finding:
- Product flow passed through `Mission -> Council -> Execution preflight -> Decision Inbox approval -> Builder live mutation`.
- Current `main` stayed clean; mutation was isolated to the linked worktree.
- Approval consumption worked: the builder live mutation approval was approved and consumed by `run-0005`.
- Artifact bundle creation worked: change-summary, patch, and diff artifacts were produced together.
- No runtime listener remained after the run.
- The local-stub builder mutation is intentionally low-signal and only appends an approval marker; this is acceptable as harness proof, not product-quality implementation output.

Next action:
- Review the linked worktree mutation through reviewer flow before deciding whether the generated change should be discarded, manually improved, or converted into a real implementation slice.
- Do not commit the linked worktree mutation unless it is intentionally promoted from dogfood evidence into reviewed implementation work.

## Dogfood Run 003
Recorded at `2026-04-29 16:05:08 +0900` on local `main`.

- head: `dd8527e86945506988231ef1e8518f023d5ba27e`
- linked worktree branch: `worktree/v1-dogfood-run-002`
- linked worktree path: `/Users/sungjin/dev/personal/orchestration--v1-dogfood-run-002`
- runtimeRoot: `/Users/sungjin/dev/personal/orchestration/var/runtime-v1-dogfood-run-002`
- command: temporary API reviewer dogfood runner against `scripts/serve-ui-slice-01.mjs`
- result: pass
- listener cleanup: no `runtime-v1-dogfood-run-002`, `60459`, `59138`, `4315`, or `59006` listener remained
- source git status after run: clean tree with `main...origin/main [ahead 10]`
- linked worktree status after run: still dirty by design, `prompts/builder.md` modified
- push state: deferred; no push was performed
- commit state: no linked worktree commit was performed

Scenario executed:
1. Reused Dogfood Run 002 runtime state with successful builder live mutation `run-0005`.
2. Ran reviewer through `/api/tasks/task-0001/run-reviewer`.
3. Confirmed reviewer created review artifact `artifact-0008`.
4. Confirmed reviewer stayed anchored to source builder run `run-0005`.
5. Confirmed task moved to `Review` with review status `passed`.
6. Confirmed commit-package readiness is now allowed but no commit-package, local commit, push, merge, or release was executed.

Evidence:
- reviewer run: `run-0006`
- review artifact: `artifact-0008`
- source builder run: `run-0005`
- raw verdict: `pass`
- mapped review status: `passed`
- next stage: `human gate`
- decision created: `false`
- artifact types: `plan`, `architecture`, `breakdown`, `preflight`, `change-summary`, `patch`, `diff`, `review`
- run roles: `planner`, `architect`, `task-breaker`, `builder:preflight`, `builder:live-mutation`, `reviewer`
- pending inbox items after review: none
- commit package readiness: allowed with source review artifact `artifact-0008`

Reviewer artifact excerpt:

```md
# Reviewer Report: V1 dogfood linked worktree live mutation

## Review Verdict
- verdict: pass
- source builder run: run-0005
- preflight artifact: artifact-0004
- change-summary artifact: artifact-0005
- patch artifact: artifact-0006
- diff artifact: artifact-0007

## Next Action
- Route to human gate after review.
```

Triage finding:
- Product flow passed through `Mission -> Council -> Execution preflight -> Decision Inbox approval -> Builder live mutation -> Reviewer`.
- Reviewer anchoring worked: review artifact points back to builder run `run-0005` and the latest builder mutation bundle.
- Task review state advanced to `passed`, and the downstream human gate/commit-package readiness became available.
- Current `main` stayed clean; linked worktree mutation remained isolated and uncommitted.
- No runtime listener remained after the run.

Next action:
- Do not promote the local-stub marker mutation as implementation output.
- Either discard the linked worktree dogfood branch after evidence review, or convert the reusable API dogfood runner into a repo-native script if this flow should become a repeatable v1 dogfood gate.

## Repo-native Dogfood Runner
The repeated temporary API runner has been converted into `scripts/v1-dogfood-linked-worktree-runner.mjs`.

Default behavior is safe preview:
- The runner defaults to non-mutating `--dry-run`.
- `--dry-run` reports source `project_path`, target branch, target linked worktree path, runtime root, source git status, existing-path checks, and the no-commit/no-push boundary.
- `--dry-run` does not start the UI server, create runtime state, create a branch, create a linked worktree, request approval, mutate files, commit, push, merge, release, or close out.

Mutation behavior is explicit:
- `--execute --slug <slug>` is required before the runner starts `scripts/serve-ui-slice-01.mjs` and calls the product API flow.
- Execute mode refuses an existing linked worktree path, an existing `worktree/<slug>` branch, a dirty source repo, or an existing runtime root.
- Execute mode registers the source project, creates the linked worktree through `/api/projects/:id/linked-worktrees`, creates a mission/council flow, approves the council recommendation, approves the pending builder live-mutation approval, runs builder live mutation, and runs reviewer unless `--skip-reviewer` is supplied.
- Execute mode never runs `commit-package`, `local commit`, `push`, `merge`, `release-package`, or `close-out`.

Current retained evidence:
- Dogfood Run 002 linked worktree remains dirty by design at `/Users/sungjin/dev/personal/orchestration--v1-dogfood-run-002`.
- The existing dirty linked worktree is evidence for the reviewed local-stub marker mutation, not implementation output to promote.
- Discarding that branch or removing the linked worktree remains a destructive cleanup action and requires an explicit operator decision.
