import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
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
const lockTimeoutSmokePath = path.join(repoRoot, 'scripts', 'smoke-verification-status-lock-timeout.mjs');
const completionStatusPath = path.join(repoRoot, 'scripts', 'v1-local-completion-status.mjs');
const dogfoodInventoryPath = path.join(repoRoot, 'scripts', 'v1-dogfood-evidence-inventory.mjs');
const kickoffStatusPath = path.join(repoRoot, 'scripts', 'v1-kickoff-status.mjs');
const kickoffEvidenceTriagePath = path.join(repoRoot, 'scripts', 'v1-kickoff-evidence-triage.mjs');
const readOnlyCliGuardPath = path.join(repoRoot, 'scripts', 'read-only-cli-guard.mjs');

function assertReadOnlyArgGuard(scriptPath, mode) {
  const result = spawnSync(process.execPath, [scriptPath, '--typo'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');

  const payload = JSON.parse(result.stderr);

  assert.equal(payload.ok, false);
  assert.equal(payload.mode, mode);
  assert.equal(payload.error, 'invalid-arguments');
  assert.deepEqual(payload.allowedFlags, []);
  assert.deepEqual(payload.receivedArgs, ['--typo']);
  assert.match(payload.message, new RegExp(`${mode} does not accept CLI arguments`));
}

const status = fs.readFileSync(statusPath, 'utf8');
const runbook = fs.readFileSync(runbookPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');
const lockConcurrencySmoke = fs.readFileSync(lockConcurrencySmokePath, 'utf8');
const lockTimeoutSmoke = fs.readFileSync(lockTimeoutSmokePath, 'utf8');
const completionStatus = fs.readFileSync(completionStatusPath, 'utf8');
const dogfoodInventory = fs.readFileSync(dogfoodInventoryPath, 'utf8');
const kickoffStatus = fs.readFileSync(kickoffStatusPath, 'utf8');
const kickoffEvidenceTriage = fs.readFileSync(kickoffEvidenceTriagePath, 'utf8');
const readOnlyCliGuard = fs.readFileSync(readOnlyCliGuardPath, 'utf8');

assert.match(status, /mode: 'v1-operator-status'/);
assert.match(status, /requireNoCliArgs\(process\.argv\.slice\(2\), \{ mode: 'v1-operator-status' \}\)/);
assert.match(status, /scripts\/verification_status\.mjs/);
assert.match(status, /scripts\/v1-dogfood-evidence-inventory\.mjs/);
assert.match(status, /execFileSync\(process\.execPath/);
assert.match(status, /maxBuffer: 10 \* 1024 \* 1024/);
assert.doesNotMatch(status, /spawnSync/);
assert.match(status, /action: 'hold-complete-baseline'/);
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
assert.match(status, /completeBaselineAvailable/);
assert.match(status, /available: main\.aheadCount > 0 && main\.clean/);
assert.match(status, /hold the clean published completion baseline unless a concrete issue or explicit dogfood repetition is chosen/);

assert.match(runbook, /## Operator Decision Status/);
assert.match(runbook, /node scripts\/v1-operator-status\.mjs/);
assert.match(runbook, /read-only status summary/);
assert.match(runbook, /retained dogfood evidence inventory and cleanup completion state/);
assert.match(runbook, /does not push, remove worktrees, delete branches, execute dogfood, commit, merge, release, or close out/);
assert.match(runbook, /retained dogfood cleanup can be either completed or currently blocked behind explicit cleanup approval/);
assert.match(runbook, /`hold-complete-baseline` is available when `main` is clean\/published and no retained dogfood cleanup is pending/);
assert.match(runbook, /`defer-push` is available only when local `main` is ahead of `origin\/main`/);

assert.match(verificationStatus, /v1-operator-status/);
assert.match(verificationStatus, /scripts\/smoke-v1-operator-status\.mjs/);
assert.match(verificationStatus, /requireNoCliArgs\(process\.argv\.slice\(2\), \{ mode: 'synthetic-verification-status' \}\)/);
assert.match(verificationStatus, /acquireVerificationLock/);
assert.match(verificationStatus, /verification_status\.lock/);
assert.match(verificationStatus, /serialized: true/);
assert.match(verificationStatus, /VerificationLockTimeoutError/);
assert.match(verificationStatus, /lock-timeout/);
assert.match(verificationStatus, /ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS/);

assert.match(lockConcurrencySmoke, /verification-status-lock-concurrency-smoke/);
assert.match(lockConcurrencySmoke, /do not add this recursive concurrency smoke to scripts\/verification_status\.mjs/);
assert.match(lockConcurrencySmoke, /Promise\.all\(concurrentChecks\.map\(runNodeCheck\)\)/);
assert.match(lockConcurrencySmoke, /childTimeoutMs = 180_000/);
assert.match(lockTimeoutSmoke, /verification-status-lock-timeout-smoke/);
assert.match(lockTimeoutSmoke, /ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS: '1'/);
assert.match(lockTimeoutSmoke, /payload\.error, 'lock-timeout'/);
assert.match(lockTimeoutSmoke, /do not add this recursive timeout smoke to scripts\/verification_status\.mjs/);
assert.match(runbook, /node scripts\/smoke-verification-status-lock-concurrency\.mjs/);
assert.match(runbook, /node scripts\/smoke-verification-status-lock-timeout\.mjs/);
assert.match(runbook, /keep these smokes standalone/);
assert.match(runbook, /lock-timeout/);
assert.match(completionStatus, /mode: 'v1-local-completion-status'/);
assert.match(completionStatus, /requireNoCliArgs\(process\.argv\.slice\(2\), \{ mode: 'v1-local-completion-status' \}\)/);
assert.doesNotMatch(completionStatus, /nextAllowedWithoutApproval: \['defer-push'\]/);
assert.match(runbook, /node scripts\/v1-local-completion-status\.mjs/);
assert.match(runbook, /whether push approval is currently available because local `main` is ahead of `origin\/main`/);
assert.match(runbook, /retained cleanup is either complete or approval-blocked/);
assert.match(completionStatus, /nextAllowedWithoutApproval: \(operatorStatus\.operatorChoices \|\| \[\]\)/);
assert.match(dogfoodInventory, /requireNoCliArgs\(process\.argv\.slice\(2\), \{ mode: 'v1-dogfood-evidence-inventory' \}\)/);
assert.match(kickoffStatus, /requireNoCliArgs\(process\.argv\.slice\(2\), \{ mode: 'v1-kickoff-status' \}\)/);
assert.match(kickoffEvidenceTriage, /requireNoCliArgs\(process\.argv\.slice\(2\), \{ mode: 'v1-kickoff-evidence-triage' \}\)/);
assert.match(readOnlyCliGuard, /allowedFlags: \[\]/);
assert.match(runbook, /reject unexpected CLI arguments with `error=invalid-arguments` and exit 2/);
assert.match(runbook, /top-level aggregate gates `verification_status`, `harness_verification_status`, and `ui_qa_status` use the same no-argument guard/);

assertReadOnlyArgGuard(statusPath, 'v1-operator-status');
assertReadOnlyArgGuard(completionStatusPath, 'v1-local-completion-status');
assertReadOnlyArgGuard(dogfoodInventoryPath, 'v1-dogfood-evidence-inventory');
assertReadOnlyArgGuard(kickoffStatusPath, 'v1-kickoff-status');
assertReadOnlyArgGuard(kickoffEvidenceTriagePath, 'v1-kickoff-evidence-triage');
assertReadOnlyArgGuard(verificationStatusPath, 'synthetic-verification-status');

console.log(
  JSON.stringify(
    {
      ok: true,
      v1OperatorStatus: {
        approvalGatedChoices: [
          'cleanup-retained-dogfood-worktrees',
          'push-main',
          'run-another-dogfood-execute',
        ],
        noApprovalChoices: ['hold-complete-baseline', 'defer-push'],
        document: 'docs/15_v1-start-runbook.md',
        readOnlyStatus: 'scripts/v1-operator-status.mjs',
      },
    },
    null,
    2,
  ),
);
