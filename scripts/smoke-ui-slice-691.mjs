import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-691-llm-native-primary-workstream-language-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const controlSnapshotsSource = fs.readFileSync(
  new URL('../ui/control-snapshots.js', import.meta.url),
  'utf8',
);
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/108_llm-native-primary-workstream-language-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

function getControlSnapshotFunctionSource(name) {
  const start = controlSnapshotsSource.indexOf(`export function ${name}(`);
  const end = controlSnapshotsSource.indexOf('\nexport function ', start + 1);

  assert.notEqual(start, -1, `Missing control snapshot function ${name}`);
  return controlSnapshotsSource.slice(start, end === -1 ? controlSnapshotsSource.length : end);
}

const missionLeadSource = getFunctionSource('renderLlmMissionLead');
const missionWorkstreamSource = getFunctionSource('renderLlmMissionWorkstream');
const missionInspectorSource = getFunctionSource('renderLlmMissionInspector');
const missionNextActionSource = getControlSnapshotFunctionSource('getMissionNextActionPreview');
const councilSource = getFunctionSource('renderCouncilConversationSurface');
const executionSource = getFunctionSource('renderExecutionConversationSurface');
const executionWaitingSource = getFunctionSource('renderExecutionWaitingSurface');
const executionProgressSource = getFunctionSource('renderExecutionCheckpointProgress');
const executionEvidenceSource = getFunctionSource('renderExecutionSourceProvenance');
const deliverablesFlowSource = getFunctionSource('getDeliverablesSourceFlow');
const deliverablesStatusSource = getFunctionSource('getDeliverablesFlowStatusDisplay');
const deliverablesStatusToneSource = getFunctionSource('getDeliverablesFlowStatusTone');
const deliverablesProgressSource = getFunctionSource('renderDeliverablesProgress');
const deliverablesSource = getFunctionSource('renderDeliverablesConversationSurface');
const deliverablesWaitingSource = getFunctionSource('renderDeliverablesWaitingSurface');
const deliverablesEvidenceSource = getFunctionSource('renderDeliverablesSourceProvenance');

assert.match(missionLeadSource, /다음 단계/);
assert.match(appSource, /llm-context-label">미션 정보/);
assert.match(missionWorkstreamSource, /개 역할/);
assert.match(missionWorkstreamSource, /연결된 실행 태스크/);
assert.match(missionWorkstreamSource, /현재 한정 실행 상태/);
assert.match(missionWorkstreamSource, /결과가 준비됐습니다/);
assert.doesNotMatch(missionWorkstreamSource, /\broles\b|linkedTask\.id|currentArtifact\.id|bounded execution/);
assert.doesNotMatch(missionInspectorSource, /mission\.id|linkedTask\?\.id/);
assert.doesNotMatch(missionNextActionSource, /artifact\.id|gatePreview/);
assert.match(appSource, /createToken\(`미션:\$\{selectedMission\.id\}`/);
assert.match(appSource, /createToken\(`연결태스크:\$\{selectedMission\.linkedTaskId\}`/);

for (const label of ['종합 판단', '남은 쟁점', '운영자 확인', '개 역할', '태스크 연결됨']) {
  assert.match(councilSource, new RegExp(label));
}
assert.match(councilSource, /<dt>Task<\/dt>/);
assert.match(councilSource, /linkedTask\?\.id \|\| 'not-recorded'/);
assert.doesNotMatch(councilSource, /task:\$\{linkedTask\.id\}/);
assert.doesNotMatch(councilSource, /\b4 roles\b/);

for (const label of ['태스크 연결됨', '실행 기록 없음', '중단 조건', '실행 진행', '근거와 준비 상태', '실행 도구']) {
  assert.match(executionSource, new RegExp(label));
}
assert.doesNotMatch(executionSource, /task:\$\{task\.id\}/);
assert.doesNotMatch(executionSource, /run:\$\{latestRun\.id\}/);
assert.doesNotMatch(executionSource, /approval:\$\{approvalBridge\.currentApproval\.status\}/);
assert.doesNotMatch(executionSource, /inbox:\$\{approvalBridge\.pendingInboxItem\.id\}/);
assert.doesNotMatch(executionProgressSource, /checkpoint\.evidenceLabel|checkpoint\.evidenceMeta/);
assert.match(executionProgressSource, /getExecutionCheckpointEvidenceDisplay\(checkpoint\)/);
assert.match(executionWaitingSource, /<strong>Execution<\/strong>/);
for (const label of ['Task', 'Latest run', 'Approval', 'Decision Inbox', 'Stop reason']) {
  assert.match(executionEvidenceSource, new RegExp(label));
}

for (const label of ['태스크 연결됨', '결과 진행', '근거와 기록', '패키지 검토와 종료 제어', '학습과 메모리 인계']) {
  assert.match(deliverablesSource, new RegExp(label));
}
assert.doesNotMatch(deliverablesSource, /task:\$\{options\.task\.id\}/);
assert.doesNotMatch(deliverablesSource, /artifact:\$\{options\.artifacts\.length\}/);
assert.match(deliverablesSource, /getDeliverablesFlowStatusDisplay\(options\.flow\.currentStatus\)/);
assert.match(deliverablesSource, /getDeliverablesFlowStatusTone\(options\.flow\.currentStatus, options\.flow\.currentTone\)/);
assert.doesNotMatch(
  deliverablesFlowSource,
  /currentArtifact\.id|durablePackage\?\.id|acceptance\.id|closeOut\.id|preview\.id/,
);
assert.match(deliverablesWaitingSource, /<strong>Deliverables<\/strong>/);
assert.match(deliverablesProgressSource, /getEvidenceRailStatusDisplay\(step\.status\)/);
for (const label of ['Task', 'ExecutionPlan', 'Checkpoint', 'DeliveryPackage', 'Acceptance', 'Close-out']) {
  assert.match(deliverablesEvidenceSource, new RegExp(label));
}

const getDeliverablesFlowStatusDisplay = new Function(
  `${deliverablesStatusSource}; return getDeliverablesFlowStatusDisplay;`,
)();
const getDeliverablesFlowStatusTone = new Function(
  `${deliverablesStatusToneSource}; return getDeliverablesFlowStatusTone;`,
)();

assert.equal(getDeliverablesFlowStatusDisplay('waiting'), '대기');
assert.equal(getDeliverablesFlowStatusDisplay('future-status'), '확인 필요');
assert.equal(getDeliverablesFlowStatusTone('waiting', 'neutral'), 'neutral');
assert.equal(getDeliverablesFlowStatusTone('future-status', 'neutral'), 'danger');

for (const source of [councilSource, executionSource, deliverablesSource]) {
  assert.doesNotMatch(source, /fetch\(|postJson|localStorage|sessionStorage|saveState/);
}

assert.match(designSource, /Primary workstream copy uses natural operator language/);
assert.match(decisionSource, /### DEC-157/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    primarySurfaces: ['Mission', 'Council', 'Execution', 'Deliverables'],
    rawIdentifiersDemoted: true,
    exactRefsRemainCollapsed: true,
  },
  compatibility: {
    actionHandlers: 'unchanged-source-contract',
    evidenceOrder: 'unchanged-source-contract',
    protocolTerminology: 'unchanged-in-protocol-docs',
  },
  authority: {
    primaryRenderWriteBindings: 0,
    runtimeApiSchemaDependencies: 'unchanged-source-scope',
    sourceMutation: false,
    browserMatrix: 'separate-required-evidence',
  },
}, null, 2)}\n`);
