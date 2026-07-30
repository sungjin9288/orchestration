import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-durable-reviewer-rework-plan-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertHasAll(text, patterns) {
  for (const pattern of patterns) assert.match(text, pattern);
}

const plan = read('docs/129_ai-company-durable-reviewer-rework-plan.md');
const handoff = read(
  'docs/130_ai-company-durable-reviewer-rework-plan-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const reviewerPreviewPlan = read(
  'docs/127_ai-company-reviewer-rework-preview-plan.md',
);
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const runtimeService = read('src/runtime/runtime-service.js');
const reviewerPreview = read('src/runtime/reviewer-rework-preview.js');

assertHasAll(plan, [
  /^# AI Company Durable Reviewer ReworkPlan$/m,
  /operator-decision-ai-company-durable-reviewer-rework-plan-planning-001/,
  /approve-ai-company-durable-reviewer-rework-plan-planning-only/,
  /`DEC-189` records this planning-only boundary/,
  /`DEC-190` records the complete fielded implementation/,
  /implementation decision is consumed as `DEC-191`/,
  /source-current `DEC-188` response-only/,
  /one immutable local `ReworkPlan` audit record/,
  /does not append a Builder WorkOrder or WorkOrderAttempt/,
  /sequences\.reworkPlan/,
  /^reworkPlans$/m,
  /No existing record gains a required reverse reference/,
  /^status=review-required$/m,
  /^nextAttemptNumber=2$/m,
  /^maxAdditionalBuilderAttempts=1$/m,
  /^allowedActions=\[\]$/m,
  /retain source order, duplicate occurrences/,
  /`createdAt` equals the\s+normalized `recordApproval\.reviewedAt`/,
  /record-rework-plan/,
  /record-exact-reviewer-rework-plan-without-execution/,
  /at most 500 UTF-8 bytes/,
  /POST \/api\/execution-plans\/:executionPlanId\/rework-plans/,
  /JSON body has exactly these ten keys/,
  /^previewId$/m,
  /^previewDigest$/m,
  /^recordApproval$/m,
  /recomputes the complete `DEC-188` preview/,
  /one atomic migration-plus-append save/,
  /exact normalized replay returns the existing record/,
  /GET \/api\/rework-plans\/:reworkPlanId/,
  /GET \/api\/execution-plans\/:executionPlanId\/rework-plan/,
  /not a\s+collection, list, history, search, ranking, recommendation, automatic selection/,
  /generic `\/api\/snapshot` excludes the `reworkPlans` map/,
  /Record rework plan/,
  /expose no `Approve rework`, `Start rework`, `Retry`/,
  /scripts\/smoke-ui-slice-704\.mjs/,
  /`DEC-191` implements schema v22/,
]);

for (const field of [
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
]) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}

assertHasAll(handoff, [
  /^# AI Company Durable Reviewer ReworkPlan Implementation Decision Handoff$/m,
  /Planning-only decision: accepted as `DEC-189`/,
  /Implementation handoff: recorded as `DEC-190`/,
  /Complete fielded implementation decision: accepted as `DEC-191`/,
  /Implementation authority: consumed by the bounded record-and-inspect slice/,
  /decisionId=operator-decision-ai-company-durable-reviewer-rework-plan-implementation-001/,
  /decisionStatus=approve-ai-company-durable-reviewer-rework-plan-implementation-slice/,
  /one deterministic local schema-v22 immutable review-required ReworkPlan/,
  /exact DEC-188 preview id and digest/,
  /separate recordApproval decision=record-rework-plan/,
  /atomically migrate valid state and append one immutable ReworkPlan/,
  /allowedActions empty blockedActions approval digests and createdAt equal to approval reviewedAt/,
  /add schemaVersion 22 plus only sequences\.reworkPlan and reworkPlans/,
  /scripts\/smoke-ai-company-durable-reviewer-rework-plan\.mjs/,
  /scripts\/smoke-ui-slice-704\.mjs/,
  /schema-v23 migration, ReworkPlan decision acceptance rejection/,
  /permits record creation and exact inspection only/,
  /Generic approval, broad continuation, delegated self-approval/,
  /`DEC-191` supplied the exact valid outcome and consumed this gate/,
]);

for (const decisionId of ['DEC-188', 'DEC-189', 'DEC-190', 'DEC-191']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-189[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, schema, API, UI/,
);
assert.match(
  decisionLog,
  /### DEC-190[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*reserved for `DEC-191`/,
);
assert.match(
  decisionLog,
  /### DEC-191[\s\S]*Status: `Accepted`[\s\S]*schema-v22 immutable `ReworkPlan\(status=review-required\)`/,
);

for (const text of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
  reviewerPreviewPlan,
  readme,
]) {
  assert.match(text, /DEC-189/);
  assert.match(text, /DEC-190/);
  assert.match(text, /DEC-191/);
}

assert.match(inventory, /AI Company durable Reviewer ReworkPlan planning \| pass/);
assert.match(inventory, /AI Company durable Reviewer ReworkPlan implementation \| pass/);
assert.match(readme, /docs\/129_ai-company-durable-reviewer-rework-plan\.md/);
assert.match(
  readme,
  /docs\/130_ai-company-durable-reviewer-rework-plan-implementation-decision-handoff\.md/,
);
assert.match(
  taskLedger,
  /ai-company-durable-reviewer-rework-plan-implementation-post-m7-2025/,
);
assert.match(
  lessons,
  /durable rework plan[\s\S]*execution approval[\s\S]*append-only evidence/i,
);
assert.match(
  verification,
  /id: 'ai-company-durable-reviewer-rework-plan-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-durable-reviewer-rework-plan-planning\.mjs'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-durable-reviewer-rework-plan\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 24/);
assert.match(contracts, /const REWORK_PLAN_STATE_SCHEMA_VERSION = 22/);
assert.match(runtimeService, /function getReviewerReworkPlanPreview\(input\)/);
assert.match(reviewerPreview, /status: 'rework-review-required'/);
assert.match(reviewerPreview, /allowedActions: \[\]/);

for (const implementationPath of [
  'src/runtime/rework-plans.js',
  'scripts/smoke-ai-company-durable-reviewer-rework-plan.mjs',
  'scripts/smoke-ui-slice-704.mjs',
]) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, implementationPath)),
    true,
    `${implementationPath} must exist after DEC-191`,
  );
}

const smokeCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-.*\.mjs$/.test(name)).length;
const uiSmokeCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-ui-slice-.*\.mjs$/.test(name)).length;
assert.equal(smokeCount, 997);
assert.equal(uiSmokeCount, 711);
assert.match(readme, /997 smoke files/);
assert.match(readme, /711 UI smoke files/);

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
      durableReworkPlanAllowed: true,
      workOrderAppendAllowed: false,
      reworkExecutionAllowed: false,
      planningDecision: 'accepted-dec-189',
      handoffDecision: 'accepted-dec-190',
      implementationDecision: 'accepted-dec-191',
    },
    null,
    2,
  )}\n`,
);
