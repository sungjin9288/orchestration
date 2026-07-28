import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-reviewer-rework-preview-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertHasAll(text, patterns) {
  for (const pattern of patterns) assert.match(text, pattern);
}

const plan = read('docs/127_ai-company-reviewer-rework-preview-plan.md');
const handoff = read(
  'docs/128_ai-company-reviewer-rework-preview-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const workOrderAttempts = read('src/runtime/work-order-attempts.js');
const runtimeService = read('src/runtime/runtime-service.js');
const artifactContent = read('src/execution/coordinator/artifact-content.js');
const schedulerSmoke = read('scripts/smoke-ai-company-operator-stepped-workorder-scheduler.mjs');

assertHasAll(plan, [
  /^# AI Company Reviewer Rework Preview Plan$/m,
  /operator-delegated-ai-company-reviewer-rework-preview-planning-001/,
  /approve-ai-company-reviewer-rework-preview-planning-only/,
  /planning authority is recorded as `DEC-186`/,
  /implementation handoff is\s+recorded separately as `DEC-187`/,
  /implementation decision is accepted as\s+`DEC-188`/,
  /schema-v21 operator-stepped WorkOrder path/,
  /response-only `ReviewerReworkPlanPreview`/,
  /ExecutionPlan has `status=blocked`, `stopReason=reviewer-changes-requested`/,
  /Builder is `completed`, Reviewer is `changes-requested`, and QA remains/,
  /latest attempt is the exact selected `run-reviewer` WorkOrderAttempt/,
  /attemptNumber=1/,
  /mappedReviewStatus=changes-requested/,
  /rawVerdict=changes_requested/,
  /at least\s+one bounded non-empty finding/,
  /GET \/api\/execution-plans\/:executionPlanId\/reviewer-rework-preview/,
  /all seven query keys are required exactly once/i,
  /expectedExecutionPlanDigest/,
  /expectedAttemptRecordDigest/,
  /caller does not provide a review digest/,
  /runtime derives `reviewEvidenceDigest`/,
  /64 KiB pre-read byte cap/,
  /not a collection, list, search, recommendation, polling command/,
  /1 through 32 findings/,
  /preserve source order and duplicates/,
  /findingId=rework-finding-NN/,
  /status=rework-review-required/,
  /nextAttemptNumber=2/,
  /maxAdditionalBuilderAttempts=1/,
  /allowedActions=\[\]/,
  /byte-equivalent ordered copies/,
  /sourceProgressDigest/,
  /^persist-rework-plan$/m,
  /^enumerate-rework-plans$/m,
  /reviewer-rework-preview-\$\{previewDigest\.slice\(0, 16\)\}/,
  /Preview rework plan/,
  /must not show `Retry`, `Start rework`, `Approve`/,
  /Keep `STATE_SCHEMA_VERSION=21`/,
  /Create no approval, Decision Inbox item, Run, Artifact, WorkflowCheckpoint, WorkOrder/,
  /src\/runtime\/reviewer-rework-preview\.js/,
  /scripts\/smoke-ui-slice-703\.mjs/,
  /^## Implemented Status$/m,
  /`DEC-188` consumes the exact fielded handoff/,
  /GET \/api\/execution-plans\/:executionPlanId\/reviewer-rework-preview/,
  /Schema-v22 durable ReworkPlan record-and-inspect behavior is implemented by `DEC-191`/,
]);

for (const field of [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'implementationPlanRefs',
  'runtimePath',
  'compatibilityPlanRefs',
  'schemaPreservationRefs',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
]) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}

assertHasAll(handoff, [
  /^# AI Company Reviewer Rework Preview Implementation Decision Handoff$/m,
  /Planning-only decision: accepted as `DEC-186`/,
  /Implementation handoff: recorded as `DEC-187`/,
  /Complete fielded implementation decision: accepted as `DEC-188`/,
  /Implementation authority: consumed/,
  /decisionId=operator-decision-ai-company-reviewer-rework-preview-implementation-001/,
  /decisionStatus=approve-ai-company-reviewer-rework-preview-implementation-slice/,
  /exact seven-key GET query/,
  /64 KiB pre-read Artifact byte cap/,
  /one through 32 bounded redaction-safe source-ordered duplicate-preserving findings/,
  /targetPathAllowlist and verificationCommands byte-equivalently/,
  /maxAdditionalBuilderAttempts=1 nextAttemptNumber=2 allowedActions empty/,
  /do not edit createEmptyState file-store normalization migrations sequences maps contracts/,
  /scripts\/smoke-ui-slice-703\.mjs/,
  /schema-v22 migration, durable ReworkPlan or rework decision records/,
  /does not approve schema migration durable ReworkPlan new WorkOrder or attempt retry/,
  /valid approval outcome has been supplied and consumed as `DEC-188`/,
]);

for (const decisionId of ['DEC-185', 'DEC-186', 'DEC-187', 'DEC-188']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-186[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, API, UI, schema/,
);
assert.match(
  decisionLog,
  /### DEC-187[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*reserved for `DEC-188`/,
);
assert.match(
  decisionLog,
  /### DEC-188[\s\S]*Status: `Accepted`[\s\S]*schema-v21-preserving response-only `ReviewerReworkPlanPreview`/,
);

for (const text of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
  readme,
]) {
  assert.match(text, /DEC-186/);
  assert.match(text, /DEC-187/);
  assert.match(text, /DEC-188/);
}

assert.match(inventory, /AI Company ReviewerReworkPlanPreview planning \| pass/);
assert.match(
  inventory,
  /AI Company ReviewerReworkPlanPreview implementation \| pass/,
);
assert.match(readme, /docs\/127_ai-company-reviewer-rework-preview-plan\.md/);
assert.match(
  readme,
  /docs\/128_ai-company-reviewer-rework-preview-implementation-decision-handoff\.md/,
);
assert.match(
  taskLedger,
  /ai-company-reviewer-rework-preview-implementation-post-m7-2023/,
);
assert.match(
  lessons,
  /Reviewer rework planning[\s\S]*progress digest[\s\S]*mutation authority/i,
);
assert.match(
  verification,
  /id: 'ai-company-reviewer-rework-preview-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-reviewer-rework-preview-planning\.mjs'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-reviewer-rework-preview\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 22/);
assert.match(workOrderAttempts, /CHANGES_REQUESTED: 'changes-requested'/);
assert.match(workOrderAttempts, /RUN_REVIEWER: 'run-reviewer'/);
assertHasAll(runtimeService, [
  /function getReviewerReworkPlanPreview\(input\)/,
  /store\.loadStateSupportedReadonly\(\)/,
  /MAX_REVIEW_ARTIFACT_BYTES/,
  /buildReviewerReworkPlanPreview/,
  /byRole\.reviewer\.status = WORK_ORDER_STATUS\.CHANGES_REQUESTED/,
  /executionPlan\.status = EXECUTION_PLAN_STATUS\.BLOCKED/,
  /executionPlan\.activeWorkOrderId = null/,
  /executionPlan\.stopReason = 'reviewer-changes-requested'/,
  /WORK_ORDER_ATTEMPT_STATUS\.CHANGES_REQUESTED/,
]);
assertHasAll(artifactContent, [
  /function parseReviewerArtifactContent\(content\)/,
  /findings: parseMarkdownList\(content, 'Findings'\)/,
  /sourceBuilderRunId: verdictValues\['source builder run'\]/,
  /verificationEvidence: parseMarkdownList\(content, 'Verification Evidence'\)/,
]);
assertHasAll(schedulerSmoke, [
  /'changes-requested'/,
  /latestWorkOrderAttempt\.status, 'changes-requested'/,
  /attempt\.action === 'run-qa'/,
]);

for (const implementationPath of [
  'src/runtime/reviewer-rework-preview.js',
  'scripts/smoke-ai-company-reviewer-rework-preview.mjs',
  'scripts/smoke-ui-slice-703.mjs',
]) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, implementationPath)),
    true,
    `${implementationPath} must exist after DEC-188`,
  );
}

const smokeCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-.*\.mjs$/.test(name)).length;
const uiSmokeCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-ui-slice-.*\.mjs$/.test(name)).length;
assert.equal(smokeCount, 976);
assert.equal(uiSmokeCount, 704);
assert.match(readme, /976 smoke files/);
assert.match(readme, /704 UI smoke files/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      schemaVersion: 21,
      smokeFiles: smokeCount,
      uiSmokeFiles: uiSmokeCount,
      planningAllowed: true,
      implementationAllowed: true,
      schemaMigrationAllowed: false,
      durableReworkAllowed: false,
      workOrderAppendAllowed: false,
      mutationAllowed: false,
      planningDecision: 'accepted-dec-186',
      handoffDecision: 'accepted-dec-187',
      implementationDecision: 'accepted-dec-188',
      nextRequiredDecision:
        'operator-decision-ai-company-rework-plan-acceptance-implementation-001',
    },
    null,
    2,
  )}\n`,
);
