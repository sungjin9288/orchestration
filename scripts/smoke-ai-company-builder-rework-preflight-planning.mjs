import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-builder-rework-preflight-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertHasAll(text, patterns) {
  for (const pattern of patterns) assert.match(text, pattern);
}

function markdownSection(text, heading) {
  const start = text.indexOf(`${heading}\n`);
  assert.notEqual(start, -1, `${heading} section is required`);
  const bodyStart = start + heading.length + 1;
  const nextHeading = text.indexOf('\n## ', bodyStart);
  return text.slice(bodyStart, nextHeading === -1 ? text.length : nextHeading);
}

function textBlocks(section) {
  return [...section.matchAll(/```text\n([\s\S]*?)\n```/g)].map((match) =>
    match[1].split('\n').filter(Boolean));
}

const plan = read('docs/133_ai-company-builder-rework-preflight-plan.md');
const handoff = read(
  'docs/134_ai-company-builder-rework-preflight-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const acceptancePlan = read('docs/131_ai-company-rework-plan-acceptance-plan.md');
const readme = read('README.md');
const contracts = read('src/runtime/contracts.js');
const assertions = read('src/runtime/assertions.js');
const workOrderAttempts = read('src/runtime/work-order-attempts.js');
const fileStore = read('src/runtime/file-store.js');
const runtimeService = read('src/runtime/runtime-service.js');
const executionRequests = read('src/execution/coordinator/execution-requests.js');
const executionCoordinator = read('src/execution/execution-coordinator.js');
const localStub = read('src/execution/providers/local-stub-adapter.js');
const serveUi = read('scripts/serve-ui-slice-01.mjs');
const verificationStatus = read('scripts/verification_status.mjs');
const uiQaStatus = read('scripts/ui_qa_status.mjs');
const councilSignals = read('ui/council-signals.js');
const uiApp = read('ui/app.js');
const uiStyles = read('ui/styles.css');
const builderPrompt = read('prompts/builder.md');

assertHasAll(plan, [
  /^# AI Company Builder Rework Preflight Plan$/m,
  /operator-decision-ai-company-builder-rework-preflight-planning-001/,
  /approve-ai-company-builder-rework-preflight-planning-only/,
  /`DEC-195` records this planning-only boundary/,
  /`DEC-196` records the complete fielded implementation/,
  /reserved for `DEC-197`/,
  /does not add a fourth WorkOrder/,
  /reworkAttemptNumber=2/,
  /workOrderAttemptNumber=3/,
  /sequences\.builderReworkDispatch/,
  /^builderReworkDispatches$/m,
  /START_BUILDER_REWORK_PREFLIGHT/,
  /status=dispatched/,
  /dispatch-one-local-no-write-rework-preflight-without-mutation-approval/,
  /existingBuilderAttemptAppendAllowed=true/,
  /approvalCreationAllowed=false/,
  /sourceMutationAllowed=false/,
  /start-builder-rework-preflight/,
  /status=waiting-gate/,
  /builder-rework-preflight-complete-mutation-approval-blocked/,
  /POST \/api\/rework-plans\/:reworkPlanId\/builder-rework-preflight/,
  /JSON body has exactly these twelve keys/,
  /GET \/api\/rework-plans\/:reworkPlanId\/builder-rework-dispatch/,
  /generic `\/api\/snapshot` excludes `builderReworkDispatches`/,
  /local-stub no-write Builder rework preflight/,
  /does not create a Decision Inbox item or[\s\S]*generic Approval/,
  /ExecutionPlan\.status=blocked/,
  /Builder WorkOrder\.status=completed/,
  /workerState=preflight-ready-for-separate-mutation-approval/,
  /scripts\/smoke-ai-company-builder-rework-preflight\.mjs/,
  /scripts\/smoke-ui-slice-706\.mjs/,
  /Planning approval,[\s\S]*does not open implementation/,
]);

const dispatchBlocks = textBlocks(
  markdownSection(plan, '## BuilderReworkDispatch Contract'),
);
assert.equal(dispatchBlocks.length, 4);
assert.deepEqual(dispatchBlocks[0], [
  'id',
  'persisted',
  'status',
  'projectId',
  'missionId',
  'staffingPlanId',
  'staffingEntryId',
  'councilSessionId',
  'executionPlanId',
  'builderWorkOrderId',
  'builderWorkOrderDigest',
  'reworkPlanId',
  'reworkPlanRecordDigest',
  'reworkPlanAcceptanceId',
  'reworkPlanAcceptanceDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'reviewEvidenceDigest',
  'sourceProgressDigest',
  'reworkAttemptNumber',
  'workOrderAttemptId',
  'workOrderAttemptNumber',
  'dispatchApproval',
  'dispatchApprovalDigest',
  'authoritySummary',
  'createdAt',
  'recordDigest',
]);
assert.deepEqual(dispatchBlocks[1], [
  'persisted=true',
  'status=dispatched',
  'reworkAttemptNumber=2',
  'workOrderAttemptNumber=3',
  'createdAt=dispatchApproval.reviewedAt',
]);
assert.deepEqual(dispatchBlocks[2], [
  'decision=dispatch-builder-rework-preflight',
  'acknowledgement=dispatch-one-local-no-write-rework-preflight-without-mutation-approval',
  'rationale',
  'reviewedAt',
]);
assert.deepEqual(dispatchBlocks[3], [
  'dispatchEvidenceAllowed=true',
  'existingBuilderAttemptAppendAllowed=true',
  'localStubPreflightAllowed=true',
  'newWorkOrderAppendAllowed=false',
  'executionPlanMutationAllowed=false',
  'workOrderMutationAllowed=false',
  'reviewDecisionResolutionAllowed=false',
  'approvalCreationAllowed=false',
  'approvalResolutionAllowed=false',
  'checkpointCreationAllowed=false',
  'sourceMutationAllowed=false',
  'reviewerExecutionAllowed=false',
  'qaExecutionAllowed=false',
  'retryAllowed=false',
  'recoveryAllowed=false',
  'schedulingAllowed=false',
  'providerBackedExecutionAllowed=false',
  'memoryApplicationAllowed=false',
  'commitAllowed=false',
  'pushAllowed=false',
  'releaseAllowed=false',
  'policyMutationAllowed=false',
  'approvalBypassAllowed=false',
  'connectorCallAllowed=false',
]);

const requestBlocks = textBlocks(markdownSection(plan, '## Exact Dispatch Request'));
assert.equal(requestBlocks.length, 2);
assert.deepEqual(requestBlocks[0], [
  'POST /api/rework-plans/:reworkPlanId/builder-rework-preflight',
]);
assert.deepEqual(requestBlocks[1], [
  'reworkPlanAcceptanceId',
  'reworkPlanRecordDigest',
  'acceptanceDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'sourceProgressDigest',
  'builderWorkOrderId',
  'builderWorkOrderDigest',
  'reworkAttemptNumber',
  'workOrderAttemptNumber',
  'evaluatedAt',
  'dispatchApproval',
]);

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
for (const field of decisionFields) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}

const approvalBlocks = textBlocks(
  markdownSection(handoff, '## Valid Approval Outcome'),
);
assert.equal(approvalBlocks.length, 1);
const approvalFields = approvalBlocks[0].map((line) => line.slice(0, line.indexOf('=')));
assert.deepEqual(approvalFields, decisionFields);
assert.equal(new Set(approvalFields).size, decisionFields.length);
const approval = Object.fromEntries(
  approvalBlocks[0].map((line) => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1)];
  }),
);
assert.deepEqual(
  {
    decisionId: approval.decisionId,
    decisionStatus: approval.decisionStatus,
    targetAuthority: approval.targetAuthority,
    targetSurface: approval.targetSurface,
    implementationPlanRefs: approval.implementationPlanRefs,
    aggregateVerificationRef: approval.aggregateVerificationRef,
    approvalStatement: approval.approvalStatement,
  },
  {
    decisionId: 'operator-decision-ai-company-builder-rework-preflight-implementation-001',
    decisionStatus: 'approve-ai-company-builder-rework-preflight-implementation-slice',
    targetAuthority:
      'one deterministic local schema-v24 BuilderReworkDispatch plus one existing-Builder WorkOrderAttempt preflight execution stopping before mutation approval',
    targetSurface:
      'prompts/builder.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/builder-rework-dispatches.js, src/runtime/work-order-attempts.js, src/runtime/runtime-service.js, src/execution/coordinator/execution-requests.js, src/execution/execution-coordinator.js, src/execution/providers/local-stub-adapter.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-builder-rework-preflight.mjs, scripts/smoke-ui-slice-706.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs',
    implementationPlanRefs: 'docs/133_ai-company-builder-rework-preflight-plan.md',
    aggregateVerificationRef: 'node scripts/verification_status.mjs',
    approvalStatement:
      'I approve implementation only for one exact local schema-v24 Builder rework preflight dispatch and existing-Builder WorkOrderAttempt append described in docs/133_ai-company-builder-rework-preflight-plan.md. This permits one local-stub no-write preflight and exact inspection only. It does not approve mutation Approval creation or resolution, source mutation, Reviewer or QA execution, a second rework, retry, recovery, scheduling, provider-backed execution, memory, Git, release, policy mutation, collections, approval bypass, or connectors.',
  },
);
assertHasAll(approval.runtimePath, [
  /recompute DEC-188/,
  /reworkAttemptNumber=2 workOrderAttemptNumber=3/,
  /active existing-Builder WorkOrderAttempt action=start-builder-rework-preflight/,
  /fixed empty decisionInboxItemRefs/,
  /preserve the blocked ExecutionPlan completed Builder changes-requested Reviewer blocked QA and activeWorkOrderId null/,
  /stop before Approval or Decision Inbox creation or mutation/,
]);
assertHasAll(approval.compatibilityPlanRefs, [
  /preserve the exact three-WorkOrder graph/,
  /keep existing start-builder continue-builder run-reviewer run-qa preflight and live-mutation routes unchanged/,
]);
assertHasAll(approval.migrationPlanRefs, [
  /add schemaVersion 24 plus only sequences\.builderReworkDispatch builderReworkDispatches/,
  /preserve every valid schema-v23 value and historical WorkOrderAttempt shape and digest/,
  /create no dispatch attempt Run or Artifact during boot read migration validation GET hydration render or invalid input/,
]);
assertHasAll(approval.sourceEvidenceRefs, [
  /DEC-194/,
  /DEC-195/,
  /DEC-196/,
  /docs\/133_ai-company-builder-rework-preflight-plan\.md/,
  /src\/runtime\/work-order-attempts\.js/,
]);
assertHasAll(approval.negativeEvidenceRefs, [
  /current state is schema v23/,
  /no builderReworkDispatch sequence map contract/,
  /no rework preflight execution authority exists/,
]);
assertHasAll(approval.rollbackRefs, [
  /disable dispatch POST UI command and bounded worker entrypoint/,
  /preserve every valid schema-v24 dispatch attempt Run Artifact/,
  /leave active attempts for separately authorized quarantine or recovery/,
]);
assertHasAll(approval.focusedSmokeRefs, [
  /active-before-worker persistence interruption no-replay/,
  /fixed empty decisionInboxItemRefs/,
  /no Approval or Decision Inbox creation or mutation/,
  /exact sidecar worker-state projection with unchanged blocked graph/,
  /scripts\/smoke-ui-slice-706\.mjs/,
]);
assertHasAll(approval.stillBlockedAuthorities, [
  /new replacement or fourth WorkOrder append/,
  /live mutation Approval creation or resolution/,
  /second rework/,
  /retry recovery resume replay execution checkpoint creation/,
  /provider-backed WorkOrders/,
  /runtime-agent commit push or release/,
]);

assertHasAll(handoff, [
  /^# AI Company Builder Rework Preflight Implementation Decision Handoff$/m,
  /Complete fielded implementation decision: not supplied/,
  /Current runtime: schema v23/,
  /Reserved implementation decision: `DEC-197`/,
  /decisionId=operator-decision-ai-company-builder-rework-preflight-implementation-001/,
  /decisionStatus=approve-ai-company-builder-rework-preflight-implementation-slice/,
  /one deterministic local schema-v24 BuilderReworkDispatch/,
  /one active existing-Builder WorkOrderAttempt action=start-builder-rework-preflight/,
  /stop before Approval or Decision Inbox creation or mutation WorkflowCheckpoint source mutation/,
  /scripts\/smoke-ai-company-builder-rework-preflight\.mjs/,
  /scripts\/smoke-ui-slice-706\.mjs/,
  /broad continuation, delegated self-approval/,
  /exact approval outcome, if supplied, is recorded as `DEC-197`/,
]);

for (const decisionId of ['DEC-194', 'DEC-195', 'DEC-196']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-195[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, schema, API, UI/,
);
assert.match(
  decisionLog,
  /### DEC-196[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*reserved for `DEC-197`/,
);

for (const text of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
  readme,
]) {
  assert.match(text, /DEC-195/);
  assert.match(text, /DEC-196/);
  assert.match(text, /DEC-197/);
}

assert.match(acceptancePlan, /builderAttemptAppendAllowed=false/);
assert.match(acceptancePlan, /preflightAllowed=false/);
assert.match(contracts, /const STATE_SCHEMA_VERSION = 23;/);
assert.doesNotMatch(contracts, /BUILDER_REWORK_DISPATCH_STATE_SCHEMA_VERSION/);
assert.match(workOrderAttempts, /START_BUILDER: 'start-builder'/);
assert.match(workOrderAttempts, /CONTINUE_BUILDER: 'continue-builder'/);
assert.doesNotMatch(workOrderAttempts, /START_BUILDER_REWORK_PREFLIGHT/);
assert.match(fileStore, /plan\.sourceDigest !== attempt\.sourceDigest/);
assert.match(fileStore, /attempt\.attemptNumber !== index \+ 1/);
assert.match(runtimeService, /workOrders\.length !== 3/);
assert.match(executionCoordinator, /async function runBuilderPreflight\(input\)/);
assert.doesNotMatch(executionCoordinator, /runBuilderReworkPreflight/);
const implementationSources = {
  'prompts/builder.md': builderPrompt,
  'src/runtime/contracts.js': contracts,
  'src/runtime/assertions.js': assertions,
  'src/runtime/file-store.js': fileStore,
  'src/runtime/runtime-service.js': runtimeService,
  'src/execution/coordinator/execution-requests.js': executionRequests,
  'src/execution/execution-coordinator.js': executionCoordinator,
  'src/execution/providers/local-stub-adapter.js': localStub,
  'scripts/serve-ui-slice-01.mjs': serveUi,
  'ui/council-signals.js': councilSignals,
  'ui/app.js': uiApp,
  'ui/styles.css': uiStyles,
  'scripts/ui_qa_status.mjs': uiQaStatus,
};
for (const [relativePath, source] of Object.entries(implementationSources)) {
  for (const forbidden of [
    /BuilderReworkDispatch/,
    /builderReworkDispatch/,
    /START_BUILDER_REWORK_PREFLIGHT/,
    /start-builder-rework-preflight/,
    /builder-rework-preflight/,
    /runBuilderReworkPreflight/,
  ]) {
    assert.doesNotMatch(
      source,
      forbidden,
      `${relativePath} must not contain Stage 5D implementation before DEC-197`,
    );
  }
}
assert.match(
  verificationStatus,
  /script: 'scripts\/smoke-ai-company-builder-rework-preflight-planning\.mjs'/,
);
assert.doesNotMatch(
  verificationStatus,
  /script: 'scripts\/smoke-ai-company-builder-rework-preflight\.mjs'/,
);
assert.doesNotMatch(uiQaStatus, /smoke-ui-slice-706\.mjs/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/runtime/builder-rework-dispatches.js')),
  false,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-builder-rework-preflight.mjs')),
  false,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-706.mjs')),
  false,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      mode,
      planningDecision: 'DEC-195',
      handoffDecision: 'DEC-196',
      reservedImplementationDecision: 'DEC-197',
      currentSchemaVersion: 23,
      plannedSchemaVersion: 24,
      reworkAttemptNumber: 2,
      workOrderAttemptNumber: 3,
      implementationAuthorized: false,
    },
    null,
    2,
  ),
);
