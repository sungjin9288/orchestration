import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-680-llm-native-source-backed-deliverables-flow-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const designSource = fs.readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/97_llm-native-source-backed-deliverables-flow-plan.md', import.meta.url),
  'utf8',
);

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

const waitingSource = getFunctionSource('renderDeliverablesWaitingSurface');
const flowSource = getFunctionSource('getDeliverablesSourceFlow');
const actionSource = getFunctionSource('getDeliverablesPrimaryAction');
const actionMarkupSource = getFunctionSource('renderDeliverablesPrimaryAction');
const progressSource = getFunctionSource('renderDeliverablesProgress');
const provenanceSource = getFunctionSource('renderDeliverablesSourceProvenance');
const surfaceSource = getFunctionSource('renderDeliverablesConversationSurface');
const deliverablesSource = getFunctionSource('renderDeliverables');
const selectionSource = getFunctionSource('syncSelectionsFromMission');

for (const stage of ['Result', 'Verification', 'Package', 'Acceptance', 'Close-out']) {
  assert.match(flowSource, new RegExp(`title: '${stage}'`));
}
assert.match(flowSource, /options\.latestReviewStatus === 'passed'/);
assert.match(flowSource, /acceptance\?\.decision === 'accepted'/);
assert.match(flowSource, /Boolean\(options\.completionReady && closeOut\)/);
assert.match(flowSource, /결과 산출물 미기록/);
assert.match(flowSource, /패키지 승인 미기록/);
assert.match(flowSource, /종료 근거 미기록/);
assert.doesNotMatch(
  flowSource,
  /currentArtifact\.id|durablePackage\?\.id|acceptance\.id|closeOut\.id|preview\.id/,
);
assert.doesNotMatch(flowSource, /fetch\(|postJson|saveState|localStorage|sessionStorage/);

assert.match(actionSource, /getMissionDeliveryPackagePersistenceSummary\(/);
assert.match(actionSource, /getMissionDeliveryPackageAcceptanceSummary\(/);
assert.match(actionSource, /getMissionCloseOutSummary\(/);
for (const action of [
  'persist-delivery-package',
  'accept-delivery-package',
  'close-out-ai-company-mission',
  'open-mission',
  'open-execution',
]) {
  assert.match(actionSource, new RegExp(`action: '${action}'`));
}
assert.doesNotMatch(actionSource, /fetch\(|postJson|saveState|localStorage|sessionStorage/);
assert.match(actionMarkupSource, /data-action="\$\{escapeHtml\(command\.action\)\}"/);
assert.match(actionMarkupSource, /data-id="\$\{escapeHtml\(command\.id\)\}"/);

assert.match(progressSource, /flow\.steps/);
assert.match(progressSource, /Source-backed delivery progress/);
assert.match(progressSource, /step\.evidence/);
assert.match(progressSource, /getEvidenceRailStatusDisplay\(step\.status\)/);
assert.match(provenanceSource, /ExecutionPlan/);
assert.match(provenanceSource, /Checkpoint/);
assert.match(provenanceSource, /DeliveryPackage/);
assert.match(provenanceSource, /Acceptance/);
assert.match(provenanceSource, /Close-out/);
assert.match(provenanceSource, /Decision Inbox/);
assert.match(provenanceSource, /options\.artifacts/);

assert.match(waitingSource, /연결된 실행 태스크가 없습니다/);
assert.match(waitingSource, /data-action="open-council"/);
assert.match(waitingSource, /data-action="open-advanced-ops"/);
assert.match(surfaceSource, /class="llm-deliverables-shell"/);
assert.match(surfaceSource, /class="llm-deliverables-current"/);
assert.match(surfaceSource, /renderDeliverablesPrimaryAction\(options\.primaryAction, busy\)/);
assert.match(surfaceSource, /options\.primaryAction\.action === 'open-execution'/);
assert.match(surfaceSource, /renderDeliverablesProgress\(options\.flow\)/);
assert.match(surfaceSource, /data-deliverables-disclosure="evidence"/);
assert.match(surfaceSource, /data-deliverables-disclosure="controls"/);
assert.match(surfaceSource, /data-deliverables-disclosure="learning"/);
assert.match(surfaceSource, /결과 진행/);
assert.match(surfaceSource, /근거와 기록/);
assert.match(surfaceSource, /패키지 검토와 종료 제어/);
assert.match(surfaceSource, /학습과 메모리 인계/);
assert.doesNotMatch(
  surfaceSource,
  /renderDeliverablesReportDeck|renderDeliverablesCompletionSummary|renderExecutionEvidenceRail|renderHarnessBriefRegister/,
);
assert.doesNotMatch(surfaceSource, /fetch\(|postJson|saveState|localStorage|sessionStorage/);

assert.match(deliverablesSource, /document\.querySelector\('\.llm-app-shell'\)/);
assert.match(deliverablesSource, /renderDeliverablesWaitingSurface\(\{/);
assert.match(deliverablesSource, /renderDeliverablesConversationSurface\(\{/);
assert.match(deliverablesSource, /renderDeliveryPackagePreview\(/);
assert.match(deliverablesSource, /renderDurableDeliveryPackage\(/);
assert.match(deliverablesSource, /renderMissionLearningCandidatePreview\(/);
assert.match(deliverablesSource, /renderMemoryCandidatePreview\(/);
assert.match(deliverablesSource, /renderDeliverablesReportDeck\(\{/);
assert.match(appSource, /deliverablesDisclosures: \{[\s\S]*evidence: false,[\s\S]*controls: false,[\s\S]*learning: false/);
assert.match(appSource, /addEventListener\([\s\S]*'toggle',[\s\S]*data-deliverables-disclosure/);
assert.match(selectionSource, /state\.deliverablesDisclosures = \{[\s\S]*evidence: false,[\s\S]*controls: false,[\s\S]*learning: false/);

assert.match(stylesSource, /\.llm-deliverables-shell \{/);
assert.match(stylesSource, /\.llm-deliverables-current \{/);
assert.match(stylesSource, /\.llm-deliverables-progress-list \{/);
assert.match(stylesSource, /\.llm-deliverables-source-provenance/);
assert.match(stylesSource, /@media \(max-width: 520px\)[\s\S]*\.llm-deliverables-shell/);

assert.match(designSource, /### Deliverables Flow/);
assert.match(designSource, /Result, Verification, Package, Acceptance, and Close-out/);
assert.match(planSource, /Runtime schema: v16 unchanged/);
assert.match(planSource, /API contract: unchanged/);
assert.match(decisionSource, /### DEC-146/);
assert.match(decisionSource, /source-backed Deliverables flow slice/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    order: ['mission-context', 'current-delivery', 'bounded-command', 'delivery-progress'],
    progress: ['result', 'verification', 'package', 'acceptance', 'close-out'],
    generatedMessages: false,
    harnessInPrimaryFlow: false,
    secondaryEvidenceCollapsed: true,
  },
  compatibility: {
    legacyFallback: true,
    packageControlsPreserved: true,
    learningAndMemoryControlsPreserved: true,
    existingActionHandlers: 5,
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    inferredCompletion: false,
    automaticAcceptance: false,
  },
}, null, 2)}\n`);
