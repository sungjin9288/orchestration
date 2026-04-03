import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

const renderLogsStart = appJs.indexOf('function renderLogs(data) {');
const renderArtifactsStart = appJs.indexOf('function renderArtifacts(data) {');

assert.notEqual(renderLogsStart, -1, 'renderLogs section is required');
assert.notEqual(renderArtifactsStart, -1, 'renderArtifacts section is required');

const logsSection = appJs.slice(renderLogsStart, renderArtifactsStart);
const artifactsSection = appJs.slice(renderArtifactsStart);

assert.match(
  logsSection,
  /const logsImmediateCard = selectedTaskApprovals\.length > 0[\s\S]*label: '결재함 열기'[\s\S]*targetSurface: 'decision-inbox'/,
);
assert.match(
  artifactsSection,
  /const artifactsImmediateCard = selectedArtifactApprovals\.length > 0[\s\S]*label: '결재함 열기'[\s\S]*targetSurface: 'decision-inbox'/,
);
assert.match(logsSection, /title: `결재함에서 승인 \$\{selectedTaskApprovals\.length\}건 처리`/);
assert.match(
  artifactsSection,
  /title: `결재함에서 승인 \$\{selectedArtifactApprovals\.length\}건 처리`/,
);

const mission = Object.values(executionGateState.missions)[0];
const task = executionGateState.tasks[mission.linkedTaskId];
const approvals = Object.values(executionGateState.approvals);
const inboxItems = Object.values(executionGateState.decisionInboxItems);
const artifacts = Object.values(executionGateState.artifacts);
const runs = Object.values(executionGateState.runs);
const pendingApproval = approvals.find((approval) => approval.taskId === task.id && approval.status === 'pending');
const pendingInboxItem = inboxItems.find((item) => item.taskId === task.id && item.status === 'pending');
const latestArtifact = artifacts[artifacts.length - 1];
const latestRun = runs[runs.length - 1];

assert.ok(mission);
assert.ok(task);
assert.ok(pendingApproval);
assert.ok(pendingInboxItem);
assert.ok(latestArtifact);
assert.ok(latestRun);
assert.equal(mission.status, 'executing');
assert.equal(task.flags.waitingApproval, true);
assert.equal(pendingApproval.inboxItemId, pendingInboxItem.id);
assert.equal(pendingApproval.targetArtifactId, latestArtifact.id);
assert.equal(pendingApproval.targetRunId, latestRun.id);
assert.equal(latestArtifact.taskId, task.id);
assert.equal(latestRun.taskId, task.id);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoOpsImmediateDecisionHandoff: {
        surfaces: {
          logs: '승인 대기면 결재함 먼저 열기',
          artifacts: '승인 대기면 결재함 먼저 열기',
        },
        executionGate: {
          missionStatus: mission.status,
          taskId: task.id,
          waitingApproval: task.flags.waitingApproval,
          approvalId: pendingApproval.id,
          inboxItemId: pendingInboxItem.id,
          latestRunId: latestRun.id,
          latestArtifactId: latestArtifact.id,
        },
      },
    },
    null,
    2,
  ),
);
