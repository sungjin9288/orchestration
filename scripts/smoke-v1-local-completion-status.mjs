import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const completionStatusPath = path.join(repoRoot, 'scripts', 'v1-local-completion-status.mjs');
const runbookPath = path.join(repoRoot, 'docs', '15_v1-start-runbook.md');
const handoffPath = path.join(repoRoot, 'docs', '04_codex-handoff-master-brief.md');

const completionStatus = fs.readFileSync(completionStatusPath, 'utf8');
const runbook = fs.readFileSync(runbookPath, 'utf8');
const handoff = fs.readFileSync(handoffPath, 'utf8');

assert.match(completionStatus, /mode: 'v1-local-completion-status'/);
assert.match(completionStatus, /scripts\/v1-operator-status\.mjs/);
assert.match(completionStatus, /localDevelopmentComplete/);
assert.match(completionStatus, /statusCollectionOk/);
assert.match(completionStatus, /pushApprovalPending/);
assert.match(completionStatus, /retainedCleanupBlocked/);
assert.match(completionStatus, /retainedCleanupCompleted/);
assert.match(completionStatus, /pushSettled/);
assert.match(completionStatus, /cleanupSettled/);
assert.match(completionStatus, /nextAllowedWithoutApproval: \['defer-push'\]/);
assert.match(completionStatus, /doesNotPush: true/);
assert.match(completionStatus, /doesNotCleanWorktrees: true/);
assert.match(completionStatus, /doesNotExecuteDogfood: true/);
assert.match(completionStatus, /doesNotCommit: true/);

assert.match(runbook, /## Local Completion Status/);
assert.match(runbook, /node scripts\/v1-local-completion-status\.mjs/);
assert.match(runbook, /current local development is complete/);
assert.match(runbook, /whether push approval is currently available because local `main` is ahead of `origin\/main`/);
assert.match(runbook, /retained cleanup is either complete or approval-blocked/);
assert.match(runbook, /V1 dogfood result triage has been recorded through Dogfood Run 001 through Dogfood Run 040/);
assert.match(runbook, /Default next action without approval/);
assert.match(runbook, /representative clean user-flow proof command/);
assert.doesNotMatch(runbook, /commit Dogfood Run 025 retained-evidence docs locally after explicit commit approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 025 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 026 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 027 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 028 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 029 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 030 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 031 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /commit Dogfood Run 031 retained-evidence docs locally after explicit commit approval/);
assert.match(runbook, /Dogfood Run 031 cleanup-completed evidence is published on current `main`/);
assert.match(runbook, /Dogfood Run 032 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /Dogfood Run 033 retained-evidence docs were committed locally before destructive cleanup/);
assert.match(runbook, /Dogfood Run 033 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /Dogfood Run 034 retained-evidence docs were committed locally before destructive cleanup/);
assert.match(runbook, /Dogfood Run 034 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /Dogfood Run 035 retained-evidence docs were committed locally before destructive cleanup/);
assert.match(runbook, /Dogfood Run 035 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /Dogfood Run 036 retained-evidence docs were committed locally before destructive cleanup/);
assert.match(runbook, /Dogfood Run 036 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /Dogfood Run 037 retained-evidence docs were committed locally before destructive cleanup/);
assert.match(runbook, /Dogfood Run 037 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /Dogfood Run 038 retained-evidence docs were committed locally before destructive cleanup/);
assert.match(runbook, /Dogfood Run 038 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /Dogfood Run 038 cleanup-completed evidence is published on current `main`/);
assert.match(runbook, /Dogfood Run 039 execute was approved and completed without commit-package, local commit, push, merge, release-package, or close-out/);
assert.match(runbook, /Dogfood Run 039 retained-evidence docs were committed locally before destructive cleanup/);
assert.match(runbook, /Dogfood Run 039 retained dogfood linked worktree cleanup is complete/);
assert.match(runbook, /Dogfood Run 039 cleanup-completed evidence is published on current `main`/);
assert.match(runbook, /Dogfood Run 040 execute was approved and completed without commit-package, local commit, push, merge, release-package, or close-out/);
assert.match(runbook, /Dogfood Run 040 retained-evidence docs were committed locally before destructive cleanup/);
assert.match(runbook, /Dogfood Run 040 retained dogfood linked worktree cleanup is complete/);
assert.match(handoff, /last clean\/published v1 development baseline is `main` at `be27e1c3bd1dcc30a3f8e44d125fb14986626984`/);
assert.match(handoff, /Dogfood Run 040 executed from that clean\/published baseline/);
assert.match(handoff, /retained-evidence commit `07b4a16` preserved the intentionally dirty linked worktree evidence before cleanup/);
assert.match(handoff, /retained linked worktree cleanup has completed/);
assert.match(handoff, /cleanup-completed evidence update restores the no-retained-worktree baseline/);
assert.match(handoff, /Dogfood Run 038 retained-evidence was committed locally as `5cafefb` before destructive cleanup/);
assert.match(handoff, /Dogfood Run 039 retained-evidence was committed locally as `e2c2ff3` before destructive cleanup/);
assert.match(handoff, /Dogfood Run 040 retained-evidence was committed locally as `07b4a16` before destructive cleanup/);
assert.match(handoff, /Dogfood Run 040 retained linked worktree path `\/Users\/sungjin\/dev\/personal\/orchestration--v1-dogfood-runner-037` and branch `worktree\/v1-dogfood-runner-037` have been removed after retained-evidence commit `07b4a16` was preserved/);
assert.match(handoff, /local completion state, including whether any future local commit has reopened the push approval gate/);
assert.match(handoff, /The next action is no longer an implementation backlog item by default/);
assert.match(handoff, /Dogfood Run 002, Run 004, Run 005, Run 006, Run 007, Run 008, Run 009, Run 010, Run 011, Run 012, Run 013, Run 014, Run 015, Run 016, Run 017, Run 018, Run 019, Run 020, Run 021, Run 022, Run 023, and Run 024 retained dogfood linked worktree cleanup has completed/);
assert.match(handoff, /node scripts\/v1-kickoff-status\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1LocalCompletionStatus: {
        completionStatus: 'scripts/v1-local-completion-status.mjs',
        document: 'docs/15_v1-start-runbook.md',
        readOnly: true,
      },
    },
    null,
    2,
  ),
);
