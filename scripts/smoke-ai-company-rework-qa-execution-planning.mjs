import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-rework-qa-execution-planning-smoke';

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

const plan = read('docs/141_ai-company-rework-qa-execution-plan.md');
const handoff = read(
  'docs/142_ai-company-rework-qa-execution-implementation-decision-handoff.md',
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
const attempts = read('src/runtime/work-order-attempts.js');
const fileStore = read('src/runtime/file-store.js');
const runtime = read('src/runtime/runtime-service.js');
const coordinator = read('src/execution/execution-coordinator.js');
const qaRunner = read('src/execution/qa-node-check-runner.js');
const server = read('scripts/serve-ui-slice-01.mjs');

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
const apiRequestFields = [
  'reviewerReexecutionAttemptId',
  'reviewerReexecutionAttemptRecordDigest',
  'reviewerRunId',
  'reviewerEvidenceDigest',
  'mutationEvidenceDigest',
  'qaWorkOrderId',
  'qaWorkOrderDigest',
  'qaReadyCheckpointId',
  'checkpointDigest',
  'inputDigest',
  'authorityDigest',
  'sourceDigest',
  'qaInputDigest',
  'evaluatedAt',
  'qaRequest',
];
const qaRequestFields = [
  'decision=run-rework-qa-once',
  'acknowledgement=run-only-source-bound-node-checks-and-stop-before-delivery-package',
  'rationale',
  'reviewedAt',
];

for (const field of decisionFields) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}
assert.deepEqual(
  extractTextBlockAfter(plan, 'POST accepts exactly:'),
  apiRequestFields,
);
assert.deepEqual(
  extractTextBlockAfter(plan, '`qaRequest` has exactly:'),
  qaRequestFields,
);

assertIncludesAll(plan, [
  /Planning-only\s+authority is recorded as `DEC-207`/,
  /`DEC-208` records the complete fielded\s+implementation handoff/,
  /reserved for a later exact `DEC-209`/,
  /keeps schema v24 and the fixed three-WorkOrder/,
  /existing QA WorkOrder/,
  /QA WorkOrderAttempt #1/,
  /source-bound shell-free Node syntax check/,
  /stops at\s+`DELIVERY_READY` on pass/,
  /POST \/api\/rework-plans\/:reworkPlanId\/qa-execution/,
  /GET \/api\/rework-plans\/:reworkPlanId\/qa-execution/,
  /decision=run-rework-qa-once/,
  /run-only-source-bound-node-checks-and-stop-before-delivery-package/,
  /reviewerEvidenceDigest/,
  /qaInputDigest/,
  /`evaluatedAt` must equal `qaRequest\.reviewedAt`/,
  /actionless `QA_READY` checkpoint/,
  /attempt and running Run are\s+truthful interruption evidence/,
  /metadata\.workOrderAttemptId === attempt\.id/,
  /runRefs === \[run\.id\]/,
  /recordDigest` must be recomputed/,
  /process\.execPath --check -/,
  /same request must not call `previewExecutionPlanDelivery`/,
  /nextGate=separate-delivery-package-decision-required/,
  /nextGate=no-qa-retry-authority/,
  /strict pre-Stage-5H branch/,
  /scripts\/smoke-ai-company-rework-qa-execution\.mjs/,
  /scripts\/smoke-ui-slice-710\.mjs/,
  /Runtime\/API\/UI implementation: not authorized/,
], 'rework QA execution plan');

assertIncludesAll(handoff, [
  /operator-decision-ai-company-rework-qa-execution-implementation-001/,
  /approve-ai-company-rework-qa-execution-implementation-slice/,
  /existing QA WorkOrder and WorkOrderAttempt #1/,
  /src\/runtime\/rework-qa-execution\.js/,
  /exact path plus fifteen-key request/,
  /executionMode=rework-qa-node-check/,
  /one terminal DELIVERY_READY checkpoint/,
  /Run metadata workOrderAttemptId to equal the attempt id/,
  /attempt runRefs to equal the sole Run id/,
  /no schema migration sequence map WorkOrder or new durable domain record/,
  /scripts\/smoke-ai-company-rework-qa-execution\.mjs/,
  /scripts\/smoke-ui-slice-710\.mjs/,
  /reserved for `DEC-209`/,
], 'rework QA execution handoff');

assertIncludesAll(decisionLog, [
  /^### DEC-207$/m,
  /^### DEC-208$/m,
], 'decision log');

for (const source of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
]) {
  assert.match(source, /DEC-207/);
  assert.match(source, /DEC-208/);
  assert.match(source, /DEC-209/);
  assert.match(source, /QA/);
  assert.match(source, /DeliveryPackage/);
}

assert.match(inventory, /AI Company rework QA execution planning/);
assert.match(inventory, /DEC-207/);
assert.match(inventory, /DEC-208/);
assert.match(inventory, /informational `298\/298`, total `299\/299`/);
assert.match(readme, /docs\/141_ai-company-rework-qa-execution-plan\.md/);
assert.match(
  readme,
  /docs\/142_ai-company-rework-qa-execution-implementation-decision-handoff\.md/,
);
assert.match(readme, /991 smoke files/);
assert.match(readme, /709 UI smoke files/);
assert.match(todo, /ai-company-rework-qa-execution-planning-post-m7-2038/);
assert.match(
  lessons,
  /A QA authority transition must persist its attempt and running Run together/,
);
assert.match(
  verification,
  /id: 'ai-company-rework-qa-execution-planning'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 24/);
assert.match(attempts, /RUN_QA: 'run-qa'/);
assert.match(
  runtime,
  /throw conflict\(`ExecutionPlan \$\{executionPlan\.id\} requires an explicit run-qa step`\)/,
);
assert.match(
  runtime,
  /checkpoint\.stopReason === 'reviewer-reexecution-passed-qa-ready'/,
);
assert.match(runtime, /bundle\.workOrders\.length !== 3/);
assert.match(runtime, /!byRole\.builder/);
assert.match(runtime, /!byRole\.reviewer/);
assert.match(runtime, /!byRole\.qa/);
assert.match(
  fileStore,
  /checkpoint\.stopReason !== 'reviewer-reexecution-passed-qa-ready'/,
);
assert.match(coordinator, /async function runQaWorkOrder\(input\)/);
assert.match(qaRunner, /spawnImpl\(process\.execPath, \['--check', checkArgument\]/);
assert.match(qaRunner, /async function runSpecialistSourceBoundNodeChecks/);
assert.match(server, /deliveryPackagePreview = runtime\.previewExecutionPlanDelivery/);

const smokeFileCount = countScripts(/^smoke-.*\.mjs$/);
const uiSmokeFileCount = countScripts(/^smoke-ui-slice-.*\.mjs$/);
assert.equal(smokeFileCount, 991);
assert.equal(uiSmokeFileCount, 709);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  planningDecision: 'accepted-dec-207',
  handoffDecision: 'documented-dec-208',
  implementationDecision: 'reserved-dec-209',
  schemaVersion: 24,
  existingQaWorkOrderPlanned: true,
  qaAttemptNumber: 1,
  runtimeImplementationAllowed: false,
  deliveryPackageAllowed: false,
  smokeFileCount,
  uiSmokeFileCount,
}, null, 2)}\n`);
