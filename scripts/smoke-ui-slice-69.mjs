import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const executionLabelsPath = path.join(repoRoot, 'ui', 'execution-labels.js');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');
const artifactStructuredRenderPath = path.join(repoRoot, 'ui', 'artifact-structured-render.js');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionLabels = fs.readFileSync(executionLabelsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));
const artifactStructuredRender = fs.readFileSync(artifactStructuredRenderPath, 'utf8');

assert.match(executionLabels, /export function getGuardReasonDisplay\(reason\) \{/);
assert.match(appJs, /getRunRelationLabelDisplay,/);
assert.match(executionLabels, /export function getExecutionModeDisplay\(mode\) \{/);
assert.match(executionLabels, /export function getRunRelationLabelDisplay\(label\) \{/);
assert.match(executionLabels, /export function getBooleanDisplay\(value\) \{/);
assert.match(executionLabels, /export function getReviewerVerdictDisplay\(verdict\) \{/);
assert.match(executionLabels, /export function getReviewerVerdictTone\(verdict\) \{/);
assert.match(executionLabels, /export function getDeliveryStanceDisplay\(stance\) \{/);
assert.match(executionLabels, /export function getPackageStatusDisplay\(status\) \{/);
assert.match(executionLabels, /export function getProviderReadinessDisplay\(status\) \{/);
assert.match(artifactStructuredRender, /정렬된 하위 작업/);
assert.match(artifactStructuredRender, /체크포인트별 기대 아티팩트/);
assert.match(artifactStructuredRender, /검토한 증거/);
assert.match(artifactStructuredRender, /소스 리뷰어 번들/);
assert.match(appJs, /증적 연결/);
assert.match(appJs, /변경 파일/);
assert.match(appJs, /라이브 변경 승인 요청/);
assert.match(appJs, /라이브 변경 실행/);
assert.match(appJs, /프로젝트 이름/);
assert.match(appJs, /프로젝트 경로 \(project_path\)/);
assert.match(appJs, /현재패키지:/);
assert.match(appJs, /표면:\$\{getSurfaceDisplayName\(currentSurface\)\}/);
assert.match(appJs, /모드:\$\{getExecutionModeDisplay\(context\.executionMode\)\}/);
assert.match(appJs, /판정:\$\{getReviewerVerdictDisplay\(context\.rawVerdict\)\}/);
assert.match(appJs, /items\.map\(\(item\) => getGuardReasonDisplay\(item\)\)/);

assert.doesNotMatch(appJs, /Request Live Mutation Approval/);
assert.doesNotMatch(appJs, /Run Live Mutation/);
assert.doesNotMatch(appJs, /Runtime-derived summary for limited builder live mutation/);
assert.doesNotMatch(appJs, /current package:/);
assert.doesNotMatch(appJs, /Project Name/);

const executingMission = Object.values(executionGateState.missions)[0];
const executingTask = executionGateState.tasks[executingMission.linkedTaskId];
const executingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');

assert.ok(executingMission);
assert.ok(executingTask);
assert.ok(executingApproval);
assert.equal(executingMission.status, 'executing');
assert.equal(executingTask.flags.waitingApproval, true);
assert.equal(executingApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      koreanArtifactPreviewShell: {
        structuredPreview: [
          '정렬된 하위 작업',
          '체크포인트별 기대 아티팩트',
          '검토한 증거',
          '소스 리뷰어 번들',
          '증적 연결',
        ],
        guardPanels: ['패키지', '현재패키지', '표면', '라이브 변경 승인 요청', '라이브 변경 실행'],
        runtimeTruth: {
          missionStatus: executingMission.status,
          waitingApproval: executingTask.flags.waitingApproval,
          approvalAction: executingApproval.allowedNextAction,
        },
      },
    },
    null,
    2,
  ),
);
