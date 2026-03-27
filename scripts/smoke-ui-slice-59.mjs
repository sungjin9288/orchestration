import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const missionDraftStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-19', 'state.json');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');
const completionStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-29', 'state.json');

assert.equal(fs.existsSync(missionDraftStatePath), true, 'runtime-ui-slice-19 state.json is required');
assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');
assert.equal(fs.existsSync(completionStatePath), true, 'runtime-ui-slice-29 state.json is required');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const missionDraftState = JSON.parse(fs.readFileSync(missionDraftStatePath, 'utf8'));
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));
const completionState = JSON.parse(fs.readFileSync(completionStatePath, 'utf8'));

assert.match(indexHtml, /data-surface="mission"/);
assert.match(indexHtml, /data-surface="council"/);
assert.match(indexHtml, /data-surface="execution"/);
assert.match(indexHtml, /data-surface="deliverables"/);
assert.match(indexHtml, /Advanced Ops Mode/);
assert.match(
  indexHtml,
  /Mission, Council, Execution, and Deliverables are now the default product path\./,
);

assert.match(appJs, /Create Mission/);
assert.match(appJs, /Mission Actions/);
assert.match(appJs, /Approve Current Gate/);
assert.match(appJs, /Run Live Mutation/);
assert.match(appJs, /Run Reviewer/);
assert.match(appJs, /Prepare Commit Package/);
assert.match(appJs, /Approve Current Commit Gate/);
assert.match(appJs, /Resume Approved Local Commit/);
assert.match(appJs, /Prepare Release Package/);
assert.match(appJs, /Approve Current Release Gate/);
assert.match(appJs, /Resume Approved Close Out/);
assert.match(appJs, /Mission Completion/);
assert.match(appJs, /Prepare Next Mission/);
assert.match(appJs, /Advanced Ops Mode/);

const draftMission = Object.values(missionDraftState.missions)[0];
const draftCouncilSession = Object.values(missionDraftState.councilSessions)[0];

assert.ok(draftMission);
assert.ok(draftCouncilSession);
assert.equal(draftMission.status, 'aligning');
assert.equal(draftCouncilSession.status, 'pending-alignment');
assert.equal(draftCouncilSession.alignment.status, 'pending');
assert.deepEqual(
  draftCouncilSession.participants.map((participant) => participant.role),
  ['Conductor', 'Strategist', 'Architect', 'Decomposer'],
);

const executingMission = Object.values(executionGateState.missions)[0];
const executingTask = executionGateState.tasks[executingMission.linkedTaskId];
const executingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');
const executingApprovalItem = executingApproval?.inboxItemId
  ? executionGateState.decisionInboxItems[executingApproval.inboxItemId]
  : null;
const executingTargetArtifact = executingApproval?.targetArtifactId
  ? executionGateState.artifacts[executingApproval.targetArtifactId]
  : null;

assert.ok(executingMission);
assert.ok(executingTask);
assert.ok(executingApproval);
assert.ok(executingApprovalItem);
assert.ok(executingTargetArtifact);
assert.equal(executingMission.status, 'executing');
assert.equal(executingTask.flags.waitingApproval, true);
assert.equal(executingApproval.status, 'pending');
assert.equal(executingApproval.allowedNextAction, 'builder-live-mutation');
assert.equal(executingApprovalItem.kind, 'approval');
assert.equal(executingTargetArtifact.type, 'preflight');

const completedMission = Object.values(completionState.missions)[0];
const completedTask = completionState.tasks[completedMission.linkedTaskId];
const closeOutArtifact = Object.values(completionState.artifacts).find((artifact) => artifact.type === 'close-out');

assert.ok(completedMission);
assert.ok(completedTask);
assert.ok(closeOutArtifact);
assert.equal(completedMission.status, 'executing');
assert.equal(completedTask.lifecycleState, 'Done');
assert.equal(closeOutArtifact.type, 'close-out');

console.log(
  JSON.stringify(
    {
      ok: true,
      pivotCompletionAcceptanceFreeze: {
        defaultSurfaces: ['mission', 'council', 'execution', 'deliverables'],
        draftMissionId: draftMission.id,
        draftCouncilSessionId: draftCouncilSession.id,
        executingMissionId: executingMission.id,
        executingTaskId: executingTask.id,
        executingApprovalId: executingApproval.id,
        completedMissionId: completedMission.id,
        completedTaskId: completedTask.id,
        closeOutArtifactId: closeOutArtifact.id,
      },
    },
    null,
    2,
  ),
);
