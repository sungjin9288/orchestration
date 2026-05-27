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

const completionResult = runNodeJson('scripts/v1-local-completion-status.mjs');
const completionStatus = completionResult.parsed || {};
const approvalGatedChoices = completionStatus.approvalGatedChoices || [];
const availableApprovalActions = approvalGatedChoices
  .filter((choice) => choice.available)
  .map((choice) => choice.action);
const blockingApprovalActions = availableApprovalActions.filter(
  (action) => action !== 'run-another-dogfood-execute',
);

const kickoffReady =
  completionResult.ok &&
  completionStatus.localDevelopmentComplete === true &&
  completionStatus.currentHead?.aheadCount === 0 &&
  blockingApprovalActions.length === 0;

const report = {
  ok: completionResult.ok,
  mode: 'v1-kickoff-status',
  kickoffReady,
  readinessCriteria: {
    blockingApprovalActions,
    cleanupSettled: completionStatus.completionCriteria?.cleanupSettled === true,
    localDevelopmentComplete: completionStatus.localDevelopmentComplete === true,
    mainPublished: completionStatus.currentHead?.aheadCount === 0,
    verificationOk: completionStatus.completionCriteria?.verificationOk === true,
  },
  currentHead: completionStatus.currentHead || null,
  optionalApprovalActions: availableApprovalActions.filter((action) => action === 'run-another-dogfood-execute'),
  nextRecommendedSlice: kickoffReady
    ? {
        id: 'v1-user-flow-kickoff-slice',
        summary: 'Start in Mission, register or select a local project, create one task, run Council/Execution/Deliverables, and confirm where results and next actions appear.',
        surfaces: ['Mission', 'Council', 'Execution', 'Deliverables', 'Taskboard', 'Logs', 'Artifacts', 'Decision Inbox'],
        constraints: [
          'development pack only',
          'local-first',
          'single-user-first',
          'review before done',
          'approval before commit',
          'no push, publish, merge, release, or external release without explicit approval',
        ],
      }
    : null,
  safetyBoundary: {
    readOnly: true,
    doesNotCleanWorktrees: true,
    doesNotCommit: true,
    doesNotExecuteDogfood: true,
    doesNotMutateRuntime: true,
    doesNotPush: true,
  },
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
