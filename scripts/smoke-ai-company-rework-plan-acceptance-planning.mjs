import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-rework-plan-acceptance-planning-smoke';

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

const plan = read('docs/131_ai-company-rework-plan-acceptance-plan.md');
const handoff = read(
  'docs/132_ai-company-rework-plan-acceptance-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const durableReworkPlan = read('docs/129_ai-company-durable-reviewer-rework-plan.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const reworkPlans = read('src/runtime/rework-plans.js');
const runtimeService = read('src/runtime/runtime-service.js');

assertHasAll(plan, [
  /^# AI Company ReworkPlan Acceptance Plan$/m,
  /operator-delegated-ai-company-rework-plan-acceptance-planning-001/,
  /approve-ai-company-rework-plan-acceptance-planning-only/,
  /`DEC-192` records this planning-only boundary/,
  /`DEC-193` records the complete fielded implementation/,
  /reserved for `DEC-194`/,
  /one exact immutable\s+`ReworkPlan\(status=review-required\)`/,
  /does not append a Builder WorkOrder or WorkOrderAttempt/,
  /source ReworkPlan keeps `status=review-required`/,
  /recompute and compare its exact DEC-188 source projection/,
  /sequences\.reworkPlanAcceptance/,
  /^reworkPlanAcceptances$/m,
  /No existing ReworkPlan, ExecutionPlan, WorkOrder/,
  /^persisted=true$/m,
  /^decision=accepted$/m,
  /^nextAttemptNumber=2$/m,
  /^maxAdditionalBuilderAttempts=1$/m,
  /accept-exact-rework-plan-without-execution/,
  /reworkAcceptanceEvidenceAllowed=true/,
  /builderWorkOrderAppendAllowed=false/,
  /sourceMutationAllowed=false/,
  /createdAt=reviewedAt/,
  /at most 500 UTF-8 bytes/,
  /POST \/api\/rework-plans\/:reworkPlanId\/accept/,
  /JSON body has exactly these ten keys/,
  /^reworkPlanRecordDigest$/m,
  /^sourceProgressDigest$/m,
  /^reviewedAt$/m,
  /exact normalized replay returns the existing record/,
  /GET \/api\/rework-plans\/:reworkPlanId\/acceptance/,
  /not a collection,\s+history, search, ranking, recommendation, automatic selection/,
  /generic\s+`\/api\/snapshot` excludes the `reworkPlanAcceptances` map/,
  /Accept rework plan/,
  /expose no reject, changes-requested, Start rework, Retry/,
  /scripts\/smoke-ai-company-rework-plan-acceptance\.mjs/,
  /scripts\/smoke-ui-slice-705\.mjs/,
  /Schema\/runtime\/API\/UI implementation: completed under `DEC-194`/,
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

const contractBlocks = textBlocks(
  markdownSection(plan, '## ReworkPlanAcceptance Contract'),
);
assert.equal(contractBlocks.length, 3);
assert.deepEqual(contractBlocks[0], [
  'id',
  'persisted',
  'decision',
  'projectId',
  'missionId',
  'staffingPlanId',
  'staffingEntryId',
  'councilSessionId',
  'executionPlanId',
  'reworkPlanId',
  'reworkPlanRecordDigest',
  'previewId',
  'previewDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'reviewEvidenceDigest',
  'sourceProgressDigest',
  'nextAttemptNumber',
  'maxAdditionalBuilderAttempts',
  'acknowledgement',
  'rationale',
  'authoritySummary',
  'reviewedAt',
  'createdAt',
  'acceptanceDigest',
]);
assert.deepEqual(contractBlocks[1], [
  'persisted=true',
  'decision=accepted',
  'nextAttemptNumber=2',
  'maxAdditionalBuilderAttempts=1',
  'acknowledgement=accept-exact-rework-plan-without-execution',
  'createdAt=reviewedAt',
]);
assert.deepEqual(contractBlocks[2], [
  'reworkAcceptanceEvidenceAllowed=true',
  'reworkPlanMutationAllowed=false',
  'builderWorkOrderAppendAllowed=false',
  'builderAttemptAppendAllowed=false',
  'retryAllowed=false',
  'preflightAllowed=false',
  'approvalCreationAllowed=false',
  'approvalResolutionAllowed=false',
  'sourceMutationAllowed=false',
  'builderExecutionAllowed=false',
  'reviewerExecutionAllowed=false',
  'qaExecutionAllowed=false',
  'schedulingAllowed=false',
  'providerCallAllowed=false',
  'memoryApplicationAllowed=false',
  'commitAllowed=false',
  'pushAllowed=false',
  'releaseAllowed=false',
  'policyMutationAllowed=false',
  'approvalBypassAllowed=false',
  'connectorCallAllowed=false',
]);

const requestBlocks = textBlocks(markdownSection(plan, '## Exact Accept Request'));
assert.equal(requestBlocks.length, 2);
assert.deepEqual(requestBlocks[0], [
  'POST /api/rework-plans/:reworkPlanId/accept',
]);
assert.deepEqual(requestBlocks[1], [
  'reworkPlanRecordDigest',
  'previewId',
  'previewDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'sourceProgressDigest',
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);

const approvalBlocks = textBlocks(
  markdownSection(handoff, '## Valid Approval Outcome'),
);
assert.equal(approvalBlocks.length, 1);
const approvalFields = approvalBlocks[0].map((line) => line.slice(0, line.indexOf('=')));
assert.deepEqual(approvalFields, decisionFields);
assert.equal(new Set(approvalFields).size, decisionFields.length);

assertHasAll(handoff, [
  /^# AI Company ReworkPlan Acceptance Implementation Decision Handoff$/m,
  /Planning-only decision: accepted as `DEC-192`/,
  /Implementation handoff: recorded as `DEC-193`/,
  /Complete fielded implementation decision: accepted as `DEC-194`/,
  /Current runtime: schema v23/,
  /Implementation decision: `DEC-194`/,
  /decisionId=operator-decision-ai-company-rework-plan-acceptance-implementation-001/,
  /decisionStatus=approve-ai-company-rework-plan-acceptance-implementation-slice/,
  /one deterministic local schema-v23 append-only ReworkPlanAcceptance/,
  /exact current schema-v22 immutable review-required ReworkPlan/,
  /transitively binding review findings scope evidence attempt cap and blocked actions/,
  /recompute the exact DEC-188 source projection/,
  /atomically migrate valid state and append one immutable ReworkPlanAcceptance/,
  /add schemaVersion 23 plus only sequences\.reworkPlanAcceptance and reworkPlanAcceptances/,
  /scripts\/smoke-ai-company-rework-plan-acceptance\.mjs/,
  /scripts\/smoke-ui-slice-705\.mjs/,
  /Builder WorkOrder or WorkOrderAttempt append/,
  /permits acceptance evidence creation and exact inspection only/,
  /Generic approval, broad continuation, delegated self-approval/,
  /operator supplied the exact `Valid Approval Outcome`, accepted as `DEC-194`/,
]);

for (const decisionId of ['DEC-191', 'DEC-192', 'DEC-193', 'DEC-194']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-192[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, schema, API, UI/,
);
assert.match(
  decisionLog,
  /### DEC-193[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*reserved for `DEC-194`/,
);
assert.match(
  decisionLog,
  /### DEC-194[\s\S]*Status: `Accepted`[\s\S]*schema-v23 append-only `ReworkPlanAcceptance\(decision=accepted\)`/,
);

for (const text of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
  readme,
]) {
  assert.match(text, /DEC-192/);
  assert.match(text, /DEC-193/);
  assert.match(text, /DEC-194/);
}

assert.match(durableReworkPlan, /## Still Blocked/);
assert.match(durableReworkPlan, /ReworkPlan acceptance/);
assert.match(inventory, /AI Company ReworkPlanAcceptance planning \| pass/);
assert.match(
  readme,
  /docs\/131_ai-company-rework-plan-acceptance-plan\.md/,
);
assert.match(
  readme,
  /docs\/132_ai-company-rework-plan-acceptance-implementation-decision-handoff\.md/,
);
assert.match(
  taskLedger,
  /ai-company-rework-plan-acceptance-planning-post-m7-2026/,
);
assert.match(
  lessons,
  /Retaining a durable ReworkPlan is not the same authority as accepting it/,
);
assert.match(
  verification,
  /id: 'ai-company-rework-plan-acceptance-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-rework-plan-acceptance-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 24/);
assert.match(contracts, /const REWORK_PLAN_ACCEPTANCE_STATE_SCHEMA_VERSION = 23/);
assert.match(reworkPlans, /const REWORK_PLAN_STATUS = 'review-required'/);
assert.match(reworkPlans, /record\.allowedActions\.length !== 0/);
assert.match(runtimeService, /function getReworkPlan\(reworkPlanId\)/);
assert.match(runtimeService, /function acceptReworkPlan\(/);

for (const implementationPath of [
  'src/runtime/rework-plan-acceptances.js',
  'scripts/smoke-ai-company-rework-plan-acceptance.mjs',
  'scripts/smoke-ui-slice-705.mjs',
]) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, implementationPath)),
    true,
    `${implementationPath} must exist after DEC-194`,
  );
}

const smokeCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-.*\.mjs$/.test(name)).length;
const uiSmokeCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-ui-slice-.*\.mjs$/.test(name)).length;
assert.equal(smokeCount, 982);
assert.equal(uiSmokeCount, 706);
assert.match(readme, /982 smoke files/);
assert.match(readme, /706 UI smoke files/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      schemaVersion: 23,
      smokeFiles: smokeCount,
      uiSmokeFiles: uiSmokeCount,
      planningAllowed: true,
      implementationAllowed: true,
      schemaMigrationAllowed: true,
      acceptanceRecordAllowed: true,
      workOrderAppendAllowed: false,
      reworkExecutionAllowed: false,
      planningDecision: 'accepted-dec-192',
      handoffDecision: 'accepted-dec-193',
      implementationDecision: 'accepted-dec-194',
    },
    null,
    2,
  )}\n`,
);
