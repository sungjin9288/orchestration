import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const decisionLogPath = path.join(repoRoot, 'docs', '01_decision-log.md');
const missionDraftStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-19', 'state.json');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');
const completionStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-29', 'state.json');

assert.equal(fs.existsSync(missionDraftStatePath), true, 'runtime-ui-slice-19 state.json is required');
assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');
assert.equal(fs.existsSync(completionStatePath), true, 'runtime-ui-slice-29 state.json is required');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const decisionLog = fs.readFileSync(decisionLogPath, 'utf8');
const missionDraftState = JSON.parse(fs.readFileSync(missionDraftStatePath, 'utf8'));
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));
const completionState = JSON.parse(fs.readFileSync(completionStatePath, 'utf8'));

assert.match(indexHtml, /data-surface="mission"/);
assert.match(indexHtml, /data-surface="council"/);
assert.match(indexHtml, /data-surface="execution"/);
assert.match(indexHtml, /data-surface="deliverables"/);
assert.match(indexHtml, /고급 운영 모드/);
assert.match(
  indexHtml,
  /단일 운영자가 로컬 프로젝트를 다룰 때, 현재 프로젝트와 사람 게이트, 다음 실행 단위를 가장 먼저 읽게 만드는 warm control-plane shell입니다\./,
);
assert.match(decisionLog, /### DEC-043/);
assert.match(decisionLog, /User-facing orchestration copy defaults to Korean on the primary shell\./);

assert.match(appJs, /renderCouncilBoardroomStage\(/);
assert.match(appJs, /안건 접수 데스크/);
assert.match(appJs, /안건 접수/);
assert.match(appJs, /빠른 접수/);
assert.match(appJs, /즉시 착석/);
assert.match(appJs, /브리프 액션/);
assert.match(appJs, /현재 지시 승인/);
assert.match(appJs, /라이브 변경 실행/);
assert.match(appJs, /리뷰어 실행/);
assert.match(appJs, /커밋 패키지 준비/);
assert.match(appJs, /커밋 지시 승인/);
assert.match(appJs, /승인된 로컬 커밋 이어가기/);
assert.match(appJs, /릴리스 패키지 준비/);
assert.match(appJs, /릴리스 지시 승인/);
assert.match(appJs, /승인된 종료 정리 이어가기/);
assert.match(appJs, /안건 종료 보고/);
assert.match(appJs, /다음 안건 준비/);
assert.match(appJs, /고급 운영 모드/);

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
