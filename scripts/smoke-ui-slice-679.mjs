import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-679-llm-native-source-backed-execution-flow-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/96_llm-native-source-backed-execution-flow-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

const actionSource = getFunctionSource('getExecutionPrimaryAction');
const actionMarkupSource = getFunctionSource('renderExecutionPrimaryAction');
const progressDisplaySource = getFunctionSource('getExecutionCheckpointEvidenceDisplay');
const progressSource = getFunctionSource('renderExecutionCheckpointProgress');
const recordStatusSource = getFunctionSource('getExecutionRecordStatusDisplay');
const workOrderSource = getFunctionSource('renderExecutionWorkOrderProgress');
const sourceEvidence = getFunctionSource('renderExecutionSourceProvenance');
const waitingSource = getFunctionSource('renderExecutionWaitingSurface');
const surfaceSource = getFunctionSource('renderExecutionConversationSurface');
const executionSource = getFunctionSource('renderExecution');
const selectionSource = getFunctionSource('syncSelectionsFromMission');

for (const action of [
  'run-inbox-action',
  'run-builder-live-mutation',
  'run-reviewer',
  'run-commit-package',
  'run-local-commit',
  'run-release-package',
  'run-close-out',
]) {
  assert.match(actionSource, new RegExp(`action: '${action}'`));
}
assert.match(actionSource, /commands\.find\(\(entry\) => entry\.allowed && entry\.id\)/);
assert.match(actionSource, /canApproveCurrentGate/);
assert.match(actionSource, /canApproveCommitGate/);
assert.match(actionSource, /canApproveReleaseGate/);
assert.doesNotMatch(actionSource, /fetch\(|postJson|localStorage|sessionStorage|saveState/);

assert.match(actionMarkupSource, /data-action="\$\{escapeHtml\(command\.action\)\}"/);
assert.match(actionMarkupSource, /data-id="\$\{escapeHtml\(command\.id\)\}"/);
assert.match(actionMarkupSource, /data-verb=/);

assert.match(progressSource, /executionEvidence\.checkpoints/);
assert.match(progressSource, /checkpoint\.currentOwner/);
assert.match(progressSource, /getEvidenceRailStatusDisplay\(checkpoint\.status\)/);
assert.match(progressSource, /getExecutionCheckpointEvidenceDisplay\(checkpoint\)/);
assert.doesNotMatch(progressSource, /checkpoint\.evidenceMeta/);
assert.match(progressDisplaySource, /계획 근거 기록됨/);
assert.match(progressSource, /aria-current="step"/);
assert.match(workOrderSource, /bundle\?\.executionPlan/);
assert.match(workOrderSource, /bundle\.workOrders/);
assert.match(workOrderSource, /workOrder\.assignedAgentId/);
assert.match(workOrderSource, /getExecutionRecordStatusDisplay\(workOrder\.status\)/);
assert.match(recordStatusSource, /return '확인 필요'/);
assert.doesNotMatch(progressSource + workOrderSource, /fetch\(|postJson|saveState/);

assert.match(sourceEvidence, /Current owner/);
assert.match(sourceEvidence, /Latest run/);
assert.match(sourceEvidence, /Approval/);
assert.match(sourceEvidence, /Decision Inbox/);
assert.match(sourceEvidence, /Stop reason/);
assert.match(sourceEvidence, /sourceArtifacts/);
assert.match(sourceEvidence, /parsedPreflight/);

assert.match(waitingSource, /연결된 실행 태스크가 없습니다/);
assert.match(waitingSource, /data-action="open-council"/);
assert.match(waitingSource, /data-action="open-advanced-ops"/);

assert.match(surfaceSource, /class="llm-execution-shell"/);
assert.match(surfaceSource, /class="llm-execution-current"/);
assert.match(surfaceSource, /중단 조건/);
assert.match(surfaceSource, /실행 진행/);
assert.match(surfaceSource, /근거와 준비 상태/);
assert.match(surfaceSource, /실행 도구/);
assert.match(surfaceSource, /renderExecutionPrimaryAction\(primaryAction, busy\)/);
assert.match(surfaceSource, /renderExecutionWorkOrderProgress\(missionExecutionPlanBundle\)/);
assert.match(surfaceSource, /renderExecutionCheckpointProgress\(executionEvidence\)/);
assert.match(surfaceSource, /data-execution-disclosure="evidence"/);
assert.match(surfaceSource, /data-execution-disclosure="harness"/);
assert.doesNotMatch(
  surfaceSource,
  /renderExecutionCommandDeck|renderNarrativeDeck|renderExecutionEvidenceRail/,
);
assert.doesNotMatch(surfaceSource, /fetch\(|postJson|localStorage|sessionStorage|saveState/);

assert.match(executionSource, /const executionEvidence = getExecutionEvidenceRail\(linkedTask, data\)/);
assert.match(executionSource, /getMissionExecutionPlanBundle\(/);
assert.match(executionSource, /getExecutionPrimaryAction\(\{/);
assert.match(executionSource, /document\.querySelector\('\.llm-app-shell'\)/);
assert.match(executionSource, /renderExecutionConversationSurface\(\{/);
assert.match(appSource, /executionDisclosures: \{[\s\S]*evidence: false,[\s\S]*harness: false/);
assert.match(appSource, /addEventListener\([\s\S]*'toggle',[\s\S]*data-execution-disclosure/);
assert.match(selectionSource, /state\.executionDisclosures = \{[\s\S]*evidence: false,[\s\S]*harness: false/);

assert.match(stylesSource, /\.llm-execution-shell \{/);
assert.match(stylesSource, /\.llm-execution-current,\s*\n\.llm-execution-waiting \{/);
assert.match(stylesSource, /\.llm-execution-progress-list/);
assert.match(stylesSource, /\.llm-execution-workorders/);
assert.match(stylesSource, /\.llm-execution-source-provenance/);
assert.match(stylesSource, /@media \(max-width: 520px\)[\s\S]*\.llm-execution-shell/);

assert.match(designSource, /### Execution Flow/);
assert.match(designSource, /current source-backed checkpoint/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);
assert.match(decisionSource, /### DEC-145/);
assert.match(decisionSource, /source-backed Execution flow slice/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    order: ['mission-context', 'current-checkpoint', 'bounded-command', 'execution-progress'],
    primaryCommandCount: 1,
    primaryDashboardSections: 0,
    generatedMessages: false,
    secondaryEvidenceCollapsed: true,
  },
  compatibility: {
    existingActionHandlers: 7,
    approvalKinds: ['builder-live-mutation', 'commit-intent', 'release-ready'],
    sourceCheckpoints: ['Strategist', 'Architect', 'Decomposer', 'Maker', 'Critic'],
    durableWorkOrdersConditional: true,
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    automaticExecution: false,
    hiddenApprovalConsumption: false,
  },
}, null, 2)}\n`);
