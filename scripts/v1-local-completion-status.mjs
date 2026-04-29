import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

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
    status: result.status,
    stderr: result.stderr?.trim() || '',
    stdout,
  };
}

function summarizeApprovalGatedChoices(operatorStatus) {
  return (operatorStatus.operatorChoices || [])
    .filter((choice) => choice.requiresExplicitApproval)
    .map((choice) => ({
      action: choice.action,
      available: choice.available,
      destructive: choice.destructive,
      requiresExplicitApproval: choice.requiresExplicitApproval,
    }));
}

const operatorStatusResult = runNodeJson('scripts/v1-operator-status.mjs');
const operatorStatus = operatorStatusResult.parsed || {};
const approvalGatedChoices = summarizeApprovalGatedChoices(operatorStatus);
const mainClean = operatorStatus.main?.clean === true;
const verificationOk = operatorStatus.verification?.ok === true;
const dogfoodInventoryOk = operatorStatus.dogfoodEvidence?.inventoryOk === true;
const retainedCleanupBlocked =
  operatorStatus.dogfoodEvidence?.cleanupBlockedUntilApproval === true &&
  approvalGatedChoices.some((choice) => choice.action === 'cleanup-retained-dogfood-worktrees');
const pushApprovalPending = approvalGatedChoices.some((choice) => choice.action === 'push-main');

const statusCollectionOk = operatorStatusResult.ok && verificationOk && dogfoodInventoryOk;
const localDevelopmentComplete =
  statusCollectionOk && mainClean && pushApprovalPending && retainedCleanupBlocked;

const report = {
  ok: statusCollectionOk,
  mode: 'v1-local-completion-status',
  localDevelopmentComplete,
  completionCriteria: {
    dogfoodInventoryOk,
    mainClean,
    operatorStatusOk: operatorStatusResult.ok,
    pushApprovalPending,
    retainedCleanupBlocked,
    verificationOk,
  },
  currentHead: {
    aheadCount: operatorStatus.main?.aheadCount ?? null,
    branchLine: operatorStatus.main?.branchLine ?? null,
    head: operatorStatus.main?.head ?? null,
    shortHead: operatorStatus.main?.shortHead ?? null,
  },
  approvalGatedChoices,
  nextAllowedWithoutApproval: ['defer-push'],
  blockedUntilExplicitApproval: approvalGatedChoices
    .filter((choice) => choice.available)
    .map((choice) => choice.action),
  safetyBoundary: {
    readOnly: true,
    doesNotCleanWorktrees: true,
    doesNotCommit: true,
    doesNotExecuteDogfood: true,
    doesNotPush: true,
  },
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
