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
assert.match(runbook, /retained-evidence commit or cleanup approval is pending/);
assert.match(runbook, /retained cleanup is either complete or approval-blocked/);
assert.match(runbook, /V1 dogfood result triage has been recorded through Dogfood Run 001 through Dogfood Run 020/);
assert.match(runbook, /Default next action without approval/);
assert.match(runbook, /representative clean user-flow proof command/);
assert.match(handoff, /current local v1 development baseline is complete on `main` after the explicitly approved Dogfood Run 020 execute pass/);
assert.match(handoff, /local completion state, including push and cleanup approval gates/);
assert.match(handoff, /The next action is no longer an implementation backlog item by default/);
assert.match(handoff, /push had completed before the Dogfood Run 020 execute pass; Run 020 retained-evidence docs are ready for local evidence commit and later publish approval/);
assert.match(handoff, /Dogfood Run 002, Run 004, Run 005, Run 006, Run 007, Run 008, Run 009, Run 010, Run 011, Run 012, Run 013, Run 014, Run 015, Run 016, Run 017, Run 018, and Run 019 retained dogfood linked worktree cleanup has completed/);
assert.match(handoff, /Dogfood Run 020 retained linked worktree cleanup is pending explicit destructive approval/);
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
