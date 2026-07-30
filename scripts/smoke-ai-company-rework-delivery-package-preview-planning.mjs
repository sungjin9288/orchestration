import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-rework-delivery-package-preview-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countScripts(pattern) {
  return fs.readdirSync(path.join(repoRoot, 'scripts'))
    .filter((name) => pattern.test(name)).length;
}

function assertIncludesAll(source, patterns, label) {
  for (const pattern of patterns) {
    assert.match(source, pattern, `${label} is missing ${pattern}`);
  }
}

function extractTextBlockAfter(source, marker) {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `missing marker: ${marker}`);
  const fenceStart = source.indexOf('```text', markerIndex);
  assert.notEqual(fenceStart, -1, `missing text fence after: ${marker}`);
  const contentStart = fenceStart + '```text'.length;
  const fenceEnd = source.indexOf('```', contentStart);
  assert.notEqual(fenceEnd, -1, `missing closing fence after: ${marker}`);
  return source.slice(contentStart, fenceEnd)
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const plan = read('docs/143_ai-company-rework-delivery-package-preview-plan.md');
const handoff = read(
  'docs/144_ai-company-rework-delivery-package-preview-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const todo = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const deliveryPackages = read('src/runtime/delivery-packages.js');
const reworkQaExecution = read('src/runtime/rework-qa-execution.js');
const runtime = read('src/runtime/runtime-service.js');
const fileStore = read('src/runtime/file-store.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const app = read('ui/app.js');

const decisionFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'implementationPlanRefs',
  'runtimePath',
  'compatibilityPlanRefs',
  'migrationPlanRefs',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];
const queryFields = [
  '?qaWorkOrderAttemptId=:qaWorkOrderAttemptId',
  '&qaWorkOrderAttemptRecordDigest=:qaWorkOrderAttemptRecordDigest',
  '&qaRunId=:qaRunId',
  '&qaEvidenceArtifactId=:qaEvidenceArtifactId',
  '&deliveryReadyCheckpointId=:deliveryReadyCheckpointId',
  '&checkpointDigest=:checkpointDigest',
  '&sourceDigest=:sourceDigest',
  '&qaInputDigest=:qaInputDigest',
  '&evaluatedAt=:evaluatedAt',
];
const previewFields = [
  'id',
  'schemaVersion',
  'persisted',
  'status',
  'projectId',
  'missionId',
  'executionPlanId',
  'reworkPlanId',
  'qaWorkOrderId',
  'qaWorkOrderAttemptId',
  'qaRunId',
  'qaEvidenceArtifactId',
  'terminalCheckpointId',
  'terminalCheckpointDigest',
  'sourceDigest',
  'mutationEvidenceDigest',
  'reviewerEvidenceDigest',
  'qaInputDigest',
  'reworkDeliveryEvidenceDigest',
  'deliveredArtifactRefs',
  'workOrderResults',
  'verificationSummary',
  'acceptedRisks',
  'unresolvedItems',
  'authoritySummary',
  'generatedAt',
  'evaluatedAt',
  'allowedActions',
  'blockedActions',
  'previewDigest',
];

for (const field of decisionFields) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}

assert.deepEqual(
  extractTextBlockAfter(plan, 'The future implementation candidate opens only:').slice(1),
  queryFields,
);
assert.deepEqual(
  extractTextBlockAfter(plan, 'The response contains exactly:'),
  previewFields,
);

assertIncludesAll(plan, [
  /planning-only Stage 5I boundary/,
  /recorded as `DEC-210`/,
  /`DEC-211` records the complete fielded implementation handoff/,
  /response-only\s+`ReworkDeliveryPackagePreview`/,
  /keeps schema v24/,
  /existing generic package persistence\s+path/,
  /generic `buildExecutionPlanDeliveryPreviewFromState\(\)` cannot/,
  /Reviewer WorkOrderAttempt #2/,
  /QA WorkOrderAttempt #1/,
  /nested\s+`result` has `verdict=passed`, `mutationDetected=false`/,
  /refs are validated\s+separately from the surrounding durable records/,
  /reworkDeliveryEvidenceDigest/,
  /`generatedAt` is the exact immutable DEC-209 QA Artifact `createdAt`/,
  /schemaVersion=24/,
  /persisted=false/,
  /status=rework-delivery-preview-ready/,
  /allowedActions=\[\]/,
  /persist-delivery-package/,
  /generic `previewExecutionPlanDelivery`/,
  /`closeOutMissionAndTask` ineligible/,
  /scripts\/smoke-ai-company-rework-delivery-package-preview\.mjs/,
  /scripts\/smoke-ui-slice-711\.mjs/,
  /terminal rework fixture actually calls the generic preview/,
  /`DEC-212` satisfies the implementation gate/,
], 'rework DeliveryPackage preview plan');

assertIncludesAll(handoff, [
  /operator-decision-ai-company-rework-delivery-package-preview-implementation-001/,
  /approve-ai-company-rework-delivery-package-preview-implementation-slice/,
  /schema-v24-preserving response-only ReworkDeliveryPackagePreview/,
  /exact nine-key GET query/,
  /generatedAt fixed to the immutable DEC-209 QA Artifact createdAt/,
  /terminal rework fixture directly calling and rejecting generic preview persistence acceptance and close-out entrypoints/,
  /create no durable record/,
  /generic preview persistence acceptance and close-out functions ineligible/,
  /scripts\/smoke-ai-company-rework-delivery-package-preview\.mjs/,
  /scripts\/smoke-ui-slice-711\.mjs/,
  /accepted as `DEC-212`/,
], 'rework DeliveryPackage preview handoff');

assertIncludesAll(decisionLog, [
  /^### DEC-209$/m,
  /^### DEC-210$/m,
  /^### DEC-211$/m,
  /^### DEC-212$/m,
], 'decision log');

for (const source of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
]) {
  assert.match(source, /DEC-210/);
  assert.match(source, /DEC-211/);
  assert.match(source, /Stage 5I/);
  assert.match(source, /ReworkDeliveryPackagePreview/);
  assert.match(source, /DEC-212/);
}

assert.match(inventory, /AI Company rework DeliveryPackage preview implementation/);
assert.match(readme, /docs\/143_ai-company-rework-delivery-package-preview-plan\.md/);
assert.match(
  readme,
  /docs\/144_ai-company-rework-delivery-package-preview-implementation-decision-handoff\.md/,
);
assert.match(readme, /996 smoke files/);
assert.match(readme, /711 UI smoke files/);
assert.match(todo, /ai-company-rework-delivery-package-preview-planning-post-m7-2040/);
assert.match(
  lessons,
  /A rework delivery preview must not widen the generic durable DeliveryPackage path/,
);
assert.match(
  verification,
  /id: 'ai-company-rework-delivery-package-preview-planning'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 24/);
assert.match(deliveryPackages, /function computeDeliveryPackageDigest\(input\)/);
assert.match(runtime, /function buildExecutionPlanDeliveryPreviewFromState\(state, input\)/);
assert.match(runtime, /terminalGateApproval\.metadata\?\.consumedByRunId !== byRole\.builder\.completionRunId/);
assert.match(runtime, /function persistExecutionPlanDeliveryPackage\(input\)/);
assert.match(runtime, /function acceptDeliveryPackage\(input\)/);
assert.match(runtime, /function closeOutMissionAndTask\(input\)/);
assert.match(reworkQaExecution, /run-only-source-bound-node-checks-and-stop-before-delivery-package/);
assert.match(fileStore, /rework-qa-passed-delivery-ready/);
assert.match(server, /runtime\.previewExecutionPlanDelivery/);
assert.match(app, /data-action="persist-delivery-package"/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/runtime/rework-delivery-package-preview.js')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-rework-delivery-package-preview.mjs')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-711.mjs')),
  true,
);

const smokeFileCount = countScripts(/^smoke-.*\.mjs$/);
const uiSmokeFileCount = countScripts(/^smoke-ui-slice-.*\.mjs$/);
assert.equal(smokeFileCount, 996);
assert.equal(uiSmokeFileCount, 711);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  planningDecision: 'accepted-dec-210',
  handoffDecision: 'documented-dec-211',
  implementationDecision: 'accepted-dec-212',
  schemaVersion: 24,
  genericDeliveryPathEligible: false,
  durableDeliveryPackageAllowed: false,
  smokeFileCount,
  uiSmokeFileCount,
}, null, 2)}\n`);
