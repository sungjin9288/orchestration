import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function runGit(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function runGitOrNull(args) {
  try {
    return runGit(args);
  } catch (_error) {
    return null;
  }
}

function runNodeJson(relativeScriptPath) {
  const absoluteScriptPath = path.join(repoRoot, relativeScriptPath);
  const result = spawnSync(process.execPath, [absoluteScriptPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const stdout = result.stdout?.trim() || '';

  let parsed = null;
  try {
    parsed = stdout ? JSON.parse(stdout) : null;
  } catch (_error) {
    parsed = null;
  }

  return {
    ok: result.status === 0 && parsed?.ok === true,
    parsed,
    script: relativeScriptPath,
    status: result.status,
    stderr: result.stderr?.trim() || '',
    stdout,
  };
}

function parseAheadCount(branchLine) {
  const match = branchLine.match(/\[ahead (\d+)\]/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function getMainStatus() {
  const statusShortBranch = runGitOrNull(['status', '--short', '--branch']) || '';
  const lines = statusShortBranch.split('\n').filter(Boolean);
  const branchLine = lines[0] || '';
  const dirtyEntries = lines.slice(1);

  return {
    aheadCount: parseAheadCount(branchLine),
    branchLine,
    clean: dirtyEntries.length === 0,
    dirtyEntries,
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    statusShortBranch: statusShortBranch || 'clean',
  };
}

function getVerificationSummary(result) {
  const counts = result.parsed?.counts || {};

  return {
    ok: result.ok,
    failedInformationalChecks: counts.failedInformationalChecks ?? null,
    failedRequiredChecks: counts.failedRequiredChecks ?? null,
    informationalChecks: counts.informationalChecks ?? null,
    passedInformationalChecks: counts.passedInformationalChecks ?? null,
    passedRequiredChecks: counts.passedRequiredChecks ?? null,
    requiredChecks: counts.requiredChecks ?? null,
    script: result.script,
    status: result.status,
  };
}

function getDogfoodEvidenceSummary(result) {
  const retainedEvidenceWorktrees = result.parsed?.retainedDogfoodWorktrees || [];

  return {
    cleanupBlockedUntilApproval: result.parsed?.cleanupBlockedUntilApproval === true,
    cleanupCompleted: result.parsed?.cleanupCompleted === true,
    cleanupPolicy: result.parsed?.cleanupPolicy || null,
    inventoryOk: result.ok,
    retainedEvidenceAvailable: result.parsed?.retainedEvidenceAvailable === true,
    validEvidenceLifecycle: result.parsed?.validEvidenceLifecycle === true,
    retainedEvidenceWorktrees: retainedEvidenceWorktrees.map((entry) => ({
      branch: entry.branch,
      branchExists: entry.branchExists,
      cleanupApprovalRequired: entry.cleanupApprovalRequired,
      dirtyByDesign: entry.dirtyByDesign,
      exists: entry.exists,
      id: entry.id,
      path: entry.path,
      statusShort: entry.statusShort,
    })),
    script: result.script,
    status: result.status,
  };
}

function getOperatorChoices(main, dogfoodEvidence) {
  const hasRetainedEvidence = dogfoodEvidence.retainedEvidenceWorktrees.some(
    (entry) => entry.exists || entry.branchExists,
  );

  return [
    {
      action: 'defer-push',
      available: true,
      destructive: false,
      reason: 'Local development can continue without publishing origin/main.',
      requiresExplicitApproval: false,
    },
    {
      action: 'push-main',
      available: main.aheadCount > 0 && main.clean,
      destructive: false,
      reason: 'Publishing local main requires explicit operator approval even when the tree is clean.',
      requiresExplicitApproval: true,
    },
    {
      action: 'cleanup-retained-dogfood-worktrees',
      available: hasRetainedEvidence,
      destructive: true,
      reason: 'Retained dirty linked worktrees are evidence; removing worktrees or branches is destructive.',
      requiresExplicitApproval: true,
    },
    {
      action: 'run-another-dogfood-execute',
      available: main.clean,
      destructive: false,
      reason: 'Another linked-worktree dogfood mutation requires an explicit slug and execute approval.',
      requiresExplicitApproval: true,
    },
  ];
}

const main = getMainStatus();
const verificationResult = runNodeJson('scripts/verification_status.mjs');
const inventoryResult = runNodeJson('scripts/v1-dogfood-evidence-inventory.mjs');
const verification = getVerificationSummary(verificationResult);
const dogfoodEvidence = getDogfoodEvidenceSummary(inventoryResult);

const report = {
  ok: verification.ok && dogfoodEvidence.inventoryOk,
  mode: 'v1-operator-status',
  dogfoodEvidence,
  main,
  nextRecommendedAction: main.clean
    ? 'await explicit operator approval for retained dogfood cleanup or another execute dogfood slug, or continue with no-op defer state'
    : 'finish or commit the current local changes before push or another execute dogfood run',
  operatorChoices: getOperatorChoices(main, dogfoodEvidence),
  safetyBoundary: {
    readOnly: true,
    doesNotCommit: true,
    doesNotDeleteBranches: true,
    doesNotMerge: true,
    doesNotPush: true,
    doesNotRelease: true,
    doesNotRemoveWorktrees: true,
    doesNotRunDogfoodExecute: true,
  },
  verification,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
