import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './v1-readonly-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'v1-local-completion-status' });

function runNodeJson(relativeScriptPath) {
  const absoluteScriptPath = path.join(repoRoot, relativeScriptPath);
  const result = spawnSync(process.execPath, [absoluteScriptPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
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
const retainedCleanupCompleted = operatorStatus.dogfoodEvidence?.cleanupCompleted === true;
const pushPending = (operatorStatus.main?.aheadCount ?? 0) > 0;
const pushApprovalAvailable = approvalGatedChoices.some(
  (choice) => choice.action === 'push-main' && choice.available === true,
);
const pushSettled = !pushPending || pushApprovalAvailable;
const cleanupSettled = retainedCleanupCompleted || retainedCleanupBlocked;

const statusCollectionOk = operatorStatusResult.ok && verificationOk && dogfoodInventoryOk;
const localDevelopmentComplete =
  statusCollectionOk && mainClean && pushSettled && cleanupSettled;

const report = {
  ok: statusCollectionOk,
  mode: 'v1-local-completion-status',
  localDevelopmentComplete,
  completionCriteria: {
    dogfoodInventoryOk,
    mainClean,
    cleanupSettled,
    operatorStatusOk: operatorStatusResult.ok,
    pushApprovalAvailable,
    pushPending,
    pushSettled,
    retainedCleanupBlocked,
    retainedCleanupCompleted,
    verificationOk,
  },
  currentHead: {
    aheadCount: operatorStatus.main?.aheadCount ?? null,
    branchLine: operatorStatus.main?.branchLine ?? null,
    head: operatorStatus.main?.head ?? null,
    shortHead: operatorStatus.main?.shortHead ?? null,
  },
  approvalGatedChoices,
  nextAllowedWithoutApproval: (operatorStatus.operatorChoices || [])
    .filter((choice) => choice.available && !choice.requiresExplicitApproval)
    .map((choice) => choice.action),
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
