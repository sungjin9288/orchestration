import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const statusPath = path.join(repoRoot, 'scripts', 'v1-operator-status.mjs');
const runbookPath = path.join(repoRoot, 'docs', '15_v1-start-runbook.md');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');
const lockConcurrencySmokePath = path.join(repoRoot, 'scripts', 'smoke-verification-status-lock-concurrency.mjs');
const completionStatusPath = path.join(repoRoot, 'scripts', 'v1-local-completion-status.mjs');

const status = fs.readFileSync(statusPath, 'utf8');
const runbook = fs.readFileSync(runbookPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');
const lockConcurrencySmoke = fs.readFileSync(lockConcurrencySmokePath, 'utf8');
const completionStatus = fs.readFileSync(completionStatusPath, 'utf8');

assert.match(status, /mode: 'v1-operator-status'/);
assert.match(status, /scripts\/verification_status\.mjs/);
assert.match(status, /scripts\/v1-dogfood-evidence-inventory\.mjs/);
assert.match(status, /action: 'defer-push'/);
assert.match(status, /action: 'push-main'/);
assert.match(status, /action: 'cleanup-retained-dogfood-worktrees'/);
assert.match(status, /action: 'run-another-dogfood-execute'/);
assert.match(status, /cleanupCompleted/);
assert.match(status, /retainedEvidenceAvailable/);
assert.match(status, /validEvidenceLifecycle/);
assert.match(status, /requiresExplicitApproval: true/);
assert.match(status, /doesNotPush: true/);
assert.match(status, /doesNotRemoveWorktrees: true/);
assert.match(status, /doesNotDeleteBranches: true/);
assert.match(status, /doesNotCommit: true/);
assert.match(status, /doesNotRunDogfoodExecute: true/);

assert.match(runbook, /## Operator Decision Status/);
assert.match(runbook, /node scripts\/v1-operator-status\.mjs/);
assert.match(runbook, /read-only status summary/);
assert.match(runbook, /retained dogfood evidence inventory, mixed cleanup-completed plus retained-evidence state, and cleanup approval state/);
assert.match(runbook, /does not push, remove worktrees, delete branches, execute dogfood, commit, merge, release, or close out/);
assert.match(runbook, /Dogfood Run 005 cleanup and `run-another-dogfood-execute` remain explicit operator approval decisions/);

assert.match(verificationStatus, /v1-operator-status/);
assert.match(verificationStatus, /scripts\/smoke-v1-operator-status\.mjs/);
assert.match(verificationStatus, /acquireVerificationLock/);
assert.match(verificationStatus, /verification_status\.lock/);
assert.match(verificationStatus, /serialized: true/);

assert.match(lockConcurrencySmoke, /verification-status-lock-concurrency-smoke/);
assert.match(lockConcurrencySmoke, /do not add this recursive concurrency smoke to scripts\/verification_status\.mjs/);
assert.match(lockConcurrencySmoke, /Promise\.all\(concurrentChecks\.map\(runNodeCheck\)\)/);
assert.match(lockConcurrencySmoke, /childTimeoutMs = 180_000/);
assert.match(runbook, /node scripts\/smoke-verification-status-lock-concurrency\.mjs/);
assert.match(runbook, /keep this smoke standalone/);
assert.match(completionStatus, /mode: 'v1-local-completion-status'/);
assert.match(completionStatus, /nextAllowedWithoutApproval: \['defer-push'\]/);
assert.match(runbook, /node scripts\/v1-local-completion-status\.mjs/);
assert.match(runbook, /publish has completed and current retained evidence is either cleaned or explicitly approval-blocked/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1OperatorStatus: {
        approvalGatedChoices: [
          'cleanup-retained-dogfood-worktrees',
          'run-another-dogfood-execute',
        ],
        document: 'docs/15_v1-start-runbook.md',
        readOnlyStatus: 'scripts/v1-operator-status.mjs',
      },
    },
    null,
    2,
  ),
);
