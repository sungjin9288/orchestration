import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runQaSlice07SyntheticSmoke } from './qa-slice-07-runner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const allowDirtySource = process.env.V1_KICKOFF_ALLOW_DIRTY === '1';

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

const kickoffStatusResult = runNodeJson('scripts/v1-kickoff-status.mjs');
const kickoffStatus = kickoffStatusResult.parsed || {};
const reviewPassedRoutingResult = runNodeJson('scripts/smoke-ui-slice-638.mjs');

assert.equal(kickoffStatusResult.ok, true, 'v1-kickoff-status must collect successfully');
assert.equal(
  reviewPassedRoutingResult.ok,
  true,
  'review.status=passed result routing must stay pinned to Deliverables before v1 user-flow kickoff smoke',
);
assert.equal(
  kickoffStatus.readinessCriteria?.verificationOk,
  true,
  'verification must be green before v1 user-flow kickoff smoke',
);
assert.equal(
  kickoffStatus.readinessCriteria?.cleanupSettled,
  true,
  'retained dogfood cleanup must be settled before v1 user-flow kickoff smoke',
);

if (!allowDirtySource) {
  assert.equal(kickoffStatus.kickoffReady, true, 'v1-kickoff-status must be ready before kickoff smoke');
} else {
  assert.equal(
    kickoffStatus.readinessCriteria?.blockingApprovalActions?.every((action) => action === 'push-main'),
    true,
    'dirty-source override only allows push-main to be the blocker',
  );
}

const result = await runQaSlice07SyntheticSmoke({
  outputRoot: path.join(repoRoot, 'output', 'playwright', 'v1-user-flow-kickoff'),
  runtimeRoot: path.join(repoRoot, 'var', 'runtime-v1-user-flow-kickoff'),
});

assert.equal(result.ok, true);
assert.equal(result.scenario?.selectedSurface, 'artifacts');
assert.ok(result.scenario?.taskId);
assert.ok(result.scenario?.approvalId);
assert.ok(result.scenario?.builderRunId);
assert.ok(result.scenario?.reviewerRunId);
assert.ok(result.scenario?.changeSummaryArtifactId);
assert.ok(result.scenario?.patchArtifactId);
assert.ok(result.scenario?.diffArtifactId);
assert.ok(result.scenario?.reviewArtifactId);

const roleReadiness = result.roleReadiness || {};
for (const role of ['planner', 'architect', 'taskBreaker', 'builderPreflight', 'builderLiveMutation', 'reviewer']) {
  assert.equal(roleReadiness[role], 'ready', `${role} readiness should remain ready after kickoff flow`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'v1-user-flow-kickoff-smoke',
      kickoffReady: kickoffStatus.kickoffReady === true,
      allowDirtySource,
      outputRoot: result.outputRoot,
      runtimeRoot: result.runtimeRoot,
      reviewPassedDeliverablesRouting:
        reviewPassedRoutingResult.parsed?.deliverablesReviewPassedResultRouting || null,
      scenario: result.scenario,
      surfacesVerified: [
        'Mission',
        'Council',
        'Execution',
        'Deliverables',
        'Taskboard',
        'Logs',
        'Artifacts',
        'Decision Inbox',
      ],
      safetyBoundary: {
        doesNotCommit: true,
        doesNotPush: true,
        doesNotMerge: true,
        doesNotRelease: true,
        localFixtureOnly: true,
      },
    },
    null,
    2,
  ),
);
