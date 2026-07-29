import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-reviewer-reexecution-planning-smoke';

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

const plan = read('docs/139_ai-company-reviewer-reexecution-plan.md');
const handoff = read(
  'docs/140_ai-company-reviewer-reexecution-implementation-decision-handoff.md',
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

assertIncludesAll(plan, [
  /Planning-only authority is recorded as `DEC-204`/,
  /`DEC-205` records the complete\s+fielded implementation handoff/,
  /`DEC-206` accepts only the exact Stage 5G/,
  /implementation keeps schema v24 and the fixed WorkOrder graph/,
  /Stage 5G should run Reviewer once and stop before QA/,
  /existing Reviewer WorkOrderAttempt #2/,
  /Keep schemaVersion 24/,
  /POST \/api\/rework-plans\/:reworkPlanId\/reviewer-reexecution/,
  /GET \/api\/rework-plans\/:reworkPlanId\/reviewer-reexecution/,
  /decision=run-reviewer-reexecution/,
  /acknowledgement=review-exact-rework-result-once-and-stop-before-qa/,
  /canonical digest over the exact DEC-203/,
  /current target bytes/,
  /unrelated pending blocker/,
  /create and consume one source-bound existing `REVIEWER_READY` checkpoint/,
  /Reviewer WorkOrderAttempt #2 with `command=step`/,
  /executionMode=rework-reviewer/,
  /resolve only the retained pending Reviewer Decision refs/,
  /one local-stub\s+Reviewer request/,
  /pass-with-decision combination/,
  /nextGate=separate-qa-execution-decision-required/,
  /nextGate=no-additional-rework-authority/,
  /There is no automatic\s+retry or graph rollback/,
  /stop recomputing that historical digest from a later mutable ExecutionPlan/,
  /scripts\/smoke-ai-company-reviewer-reexecution\.mjs/,
  /scripts\/smoke-ui-slice-709\.mjs/,
  /Runtime\/API\/UI implementation: approved only for this exact Stage 5G slice by `DEC-206`/,
], 'reviewer re-execution plan');

assertIncludesAll(handoff, [
  /operator-decision-ai-company-reviewer-reexecution-implementation-001/,
  /approve-ai-company-reviewer-reexecution-implementation-slice/,
  /existing Reviewer WorkOrder and WorkOrderAttempt #2/,
  /stopping before QA execution/,
  /src\/runtime\/reviewer-reexecution\.js/,
  /exact path plus thirteen-key request/,
  /mutationEvidenceDigest/,
  /one running Reviewer Run with executionMode=rework-reviewer/,
  /one QA_READY checkpoint/,
  /no schema migration sequence map new WorkOrder or new durable domain record/,
  /scripts\/smoke-ai-company-reviewer-reexecution\.mjs/,
  /scripts\/smoke-ui-slice-709\.mjs/,
  /The complete matching decision was accepted as `DEC-206`/,
], 'reviewer re-execution handoff');

assertIncludesAll(decisionLog, [
  /^### DEC-204$/m,
  /^### DEC-205$/m,
  /^### DEC-206$/m,
], 'decision log');

for (const source of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
]) {
  assert.match(source, /DEC-204/);
  assert.match(source, /DEC-205/);
  assert.match(source, /DEC-206/);
  assert.match(source, /Reviewer/);
  assert.match(source, /QA/);
}

assert.match(inventory, /AI Company Reviewer re-execution implementation/);
assert.match(inventory, /DEC-204/);
assert.match(inventory, /DEC-205/);
assert.match(inventory, /informational `298\/298`, total `299\/299`/);
assert.match(readme, /docs\/139_ai-company-reviewer-reexecution-plan\.md/);
assert.match(
  readme,
  /docs\/140_ai-company-reviewer-reexecution-implementation-decision-handoff\.md/,
);
assert.match(readme, /991 smoke files/);
assert.match(readme, /709 UI smoke files/);
assert.match(todo, /ai-company-reviewer-reexecution-implementation-post-m7-2037/);
assert.match(
  lessons,
  /Historical execution evidence and current graph state need separate digest owners/,
);
assert.match(
  verification,
  /id: 'ai-company-reviewer-reexecution-planning'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 24/);
assert.match(attempts, /RUN_REVIEWER: 'run-reviewer'/);
assert.match(
  runtime,
  /const prior = getPlanWorkOrderAttempts\(state, executionPlan\.id\)\.find\(/,
);
assert.match(
  runtime,
  /attempt\.action === input\.action/,
);
assert.match(
  runtime,
  /run\.summary\?\.sourceRunId !== byRole\.builder\.completionRunId/,
);
assert.match(
  fileStore,
  /!isReviewerReexecutionLifecycle &&\s+computeExecutionPlanRecordDigest\(plan\) !== dispatch\.sourceExecutionPlanDigest/,
);
assert.match(
  fileStore,
  /reviewer\.status !== WORK_ORDER_STATUS\.CHANGES_REQUESTED/,
);
assert.match(coordinator, /async function runReviewer\(input\)/);
assert.match(coordinator, /async function runBuilderReworkSourceMutation\(input\)/);
assert.match(runtime, /function beginReviewerReexecution\(input\)/);
assert.match(runtime, /function completeReviewerReexecution\(input\)/);
assert.match(coordinator, /async function runReviewerReexecution\(input\)/);

const smokeFileCount = countScripts(/^smoke-.*\.mjs$/);
const uiSmokeFileCount = countScripts(/^smoke-ui-slice-.*\.mjs$/);
assert.equal(smokeFileCount, 991);
assert.equal(uiSmokeFileCount, 709);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  planningDecision: 'accepted-dec-204',
  handoffDecision: 'documented-dec-205',
  implementationDecision: 'accepted-dec-206',
  schemaVersion: 24,
  reviewerReexecutionAllowed: true,
  qaExecutionAllowed: false,
  smokeFileCount,
  uiSmokeFileCount,
}, null, 2)}\n`);
