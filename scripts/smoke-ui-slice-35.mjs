import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-16');
const statePath = path.join(runtimeRoot, 'state.json');

const smoke16Output = execFileSync(process.execPath, ['scripts/smoke-ui-slice-16.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const smoke16 = JSON.parse(smoke16Output);
const appJs = fs.readFileSync(appJsPath, 'utf8');
const runtimeState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const mission = runtimeState.missions[smoke16.mission.id];
const task = runtimeState.tasks[mission.linkedTaskId];
const latestArtifact = runtimeState.artifacts[smoke16.deliverables.latestArtifactId];
const latestApproval = runtimeState.approvals[smoke16.deliverables.approvalId];

assert.equal(smoke16.ok, true);
assert.match(appJs, /function getMissionDeliverablesPreview/);
assert.match(appJs, /Deliverables preview:/);
assert.match(appJs, /Deliverables Preview/);
assert.match(appJs, /Latest Artifact Preview/);
assert.match(appJs, /Review State/);
assert.match(appJs, /Approval State/);
assert.equal(mission.status, 'executing');
assert.equal(latestArtifact.type, 'preflight');
assert.equal(task.review.status, 'pending');
assert.equal(latestApproval.status, 'pending');
assert.equal(latestApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      deliverablesPreview: {
        missionId: mission.id,
        missionStatus: mission.status,
        linkedTaskId: mission.linkedTaskId,
        latestArtifactId: latestArtifact.id,
        latestArtifactType: latestArtifact.type,
        reviewStatus: task.review.status,
        approvalId: latestApproval.id,
        approvalStatus: latestApproval.status,
      },
    },
    null,
    2,
  ),
);
