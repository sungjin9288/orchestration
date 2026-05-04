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
assert.match(runbook, /V1 dogfood result triage has been recorded through Dogfood Run 001 through Dogfood Run 030/);
assert.match(runbook, /Default next action without approval/);
assert.match(runbook, /representative clean user-flow proof command/);
assert.doesNotMatch(runbook, /commit Dogfood Run 025 retained-evidence docs locally after explicit commit approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 025 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 026 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 027 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 028 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 029 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.doesNotMatch(runbook, /clean up the Dogfood Run 030 retained linked worktree and branch only after explicit destructive cleanup approval/);
assert.match(runbook, /commit Dogfood Run 030 cleanup-completed evidence locally after explicit commit approval/);
assert.match(handoff, /last clean\/published v1 development baseline is `main` at `b636665b0ae60d5f45b92f9405fe110f3972452a`/);
assert.match(handoff, /Dogfood Run 030 retained-evidence commit `eecd9ce` is local/);
assert.match(handoff, /retained linked worktree cleanup has completed after explicit destructive cleanup approval/);
assert.match(handoff, /local completion state, including whether any future local commit has reopened the push approval gate/);
assert.match(handoff, /The next action is no longer an implementation backlog item by default/);
assert.match(handoff, /Dogfood Run 029 cleanup-completed evidence is already published on current `origin\/main`/);
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
