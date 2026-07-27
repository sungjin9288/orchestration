import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-specialist-cell-retry-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertHasAll(text, patterns) {
  for (const pattern of patterns) assert.match(text, pattern);
}

const plan = read('docs/123_ai-company-specialist-cell-retry-plan.md');
const handoff = read(
  'docs/124_ai-company-specialist-cell-retry-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const stage4Plan = read('docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md');
const stage4bPlan = read('docs/121_ai-company-durable-specialist-batch-plan.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const fileStore = read('src/runtime/file-store.js');
const cellAttempts = read('src/runtime/specialist-cell-attempts.js');
const runtimeService = read('src/runtime/runtime-service.js');

assertHasAll(plan, [
  /^# AI Company Specialist Cell Retry Plan$/m,
  /operator-decision-ai-company-specialist-cell-retry-planning-001/,
  /approve-ai-company-specialist-cell-retry-planning-only/,
  /^## Implemented Status$/m,
  /`DEC-182` accepted the complete implementation decision/,
  /`DEC-180` records this planning-only boundary/,
  /`DEC-181` records the complete fielded/,
  /reserved for `DEC-182`/,
  /original batch and both first attempts remain immutable evidence/,
  /`parallelSpecialistsAllowed=false` remains authoritative/,
  /A retry attempt is never a new retry source/,
  /No other retry for the batch is active/,
  /Source drift does not silently create a new retry lineage/,
  /sequences\.specialistCellRetry/,
  /^specialistCellRetries$/m,
  /existing `sequences\.specialistCellAttempt` and `specialistCellAttempts` map are reused/,
  /^sourceBatchRecordDigest$/m,
  /^sourceCellAttemptRecordDigest$/m,
  /^retryPreviewId$/m,
  /^retryPreviewDigest$/m,
  /^retryRequestDigest$/m,
  /^retryApprovalDigest$/m,
  /^retryDeadlineMs$/m,
  /decision=retry-failed-cell-once/,
  /acknowledgement=retain-original-evidence-and-retry-exact-failed-cell-once/,
  /attemptNumber=2/,
  /cellDeadlineMs=retryDeadlineMs/,
  /deadlineAt=startedAt \+ retryDeadlineMs/,
  /POST \/api\/specialist-batches\/:specialistBatchId\/cell-retries/,
  /body has exactly these twelve keys/,
  /expectedBatchRecordDigest/,
  /expectedSourceCellAttemptRecordDigest/,
  /request resubmits the Stage 4A source contract/,
  /new preview id and digest are not compared with the original\s+batch preview id and digest/,
  /first successful creation returns `201`; an exact replay returns `200`/,
  /generatedAt[\s\S]*idempotent[\s\S]*specialistCellRetry[\s\S]*specialistCellAttempt/,
  /settlement conflict after active persistence returns `409`/,
  /saves both records atomically before worker invocation/,
  /invokes only the selected fixed local\s+Researcher or QA runner/,
  /does not retry a CAS conflict/,
  /leaves the active retry inspectable/,
  /retryRequestDigest[\s\S]*without source-current recomputation or worker invocation/,
  /GET \/api\/specialist-cell-retries\/:specialistCellRetryId/,
  /GET \/api\/specialist-batches\/:specialistBatchId\/cell-retry/,
  /It is not a collection, list, search, history, or automatic selection surface/,
  /generic `\/api\/snapshot` continues to omit/,
  /There is no retry-all, automatic retry, cancel, resume, provider, result-application/,
  /active-attempt (?:recovery|reconciliation)[\s\S]{0,80}later Ops supervision/i,
  /exact `DEC-182` decision was accepted and consumed/,
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
  /^# AI Company Specialist Cell Retry Implementation Decision Handoff$/m,
  /decisionId=operator-decision-ai-company-specialist-cell-retry-implementation-001/,
  /decisionStatus=approve-ai-company-specialist-cell-retry-implementation-slice/,
  /one deterministic local schema-v21 durable SpecialistCellRetry/,
  /one exact attemptNumber=2 execution/,
  /source batch and both first attempts remain immutable/,
  /exact twelve-key bounded JSON request/,
  /return an existing active or terminal retry before source-current recomputation/,
  /evaluatedAt makes the new preview identity intentionally distinct from the original batch preview/,
  /no existing retry for that source cell and no active retry for the batch/,
  /atomically migrate valid v20 state to v21/,
  /preserve the source batch and both original attempts byte-for-byte/,
  /invoke only the selected fixed local Researcher or QA runner once/,
  /one fresh-state CAS write without conflict retry/,
  /exact 201 creation 200 replay exact-id GET exact batch-plus-source-cell lookup and post-active conflict envelopes/,
  /never infer or reconcile an active retry after interruption/,
  /add schemaVersion 21 plus only sequences\.specialistCellRetry and specialistCellRetries/,
  /reuse the existing specialistCellAttempt sequence and map for attemptNumber=2/,
  /scripts\/smoke-ui-slice-701\.mjs/,
  /exact `Valid Approval Outcome` was supplied and recorded as `DEC-182`/,
  /implementation gate\s+is consumed/,
]);

for (const decisionId of ['DEC-179', 'DEC-180', 'DEC-181', 'DEC-182']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-180[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, schema, API, UI/,
);
assert.match(
  decisionLog,
  /### DEC-181[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*reserved for `DEC-182`/,
);
assert.match(
  decisionLog,
  /### DEC-182[\s\S]*Status: `Accepted`[\s\S]*same-role `SpecialistCellAttempt`[\s\S]*source batch and both original first attempts remain immutable/i,
);

for (const text of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
  stage4Plan,
  stage4bPlan,
  readme,
]) {
  assert.match(text, /DEC-180/);
  assert.match(text, /DEC-181/);
  assert.match(text, /DEC-182/);
}

assert.match(inventory, /AI Company SpecialistCellRetry planning \| pass/);
assert.match(inventory, /AI Company SpecialistCellRetry implementation \| pass/);
assert.match(readme, /docs\/123_ai-company-specialist-cell-retry-plan\.md/);
assert.match(
  readme,
  /docs\/124_ai-company-specialist-cell-retry-implementation-decision-handoff\.md/,
);
assert.match(taskLedger, /ai-company-specialist-cell-retry-implementation-post-m7-2019/);
assert.match(
  lessons,
  /failed specialist retry[\s\S]*immutable first-attempt evidence/i,
);
assert.match(
  lessons,
  /timestamp-derived preview identity[\s\S]*fresh current preview[\s\S]*stable source and selected-cell digests/i,
);
assert.match(
  verification,
  /id: 'ai-company-specialist-cell-retry-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-specialist-cell-retry-planning\.mjs'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-specialist-cell-retry\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 21/);
assert.match(contracts, /specialistCellRetry: 0/);
assert.match(
  cellAttempts,
  /expectedAttemptNumber/,
);
assert.match(fileStore, /SpecialistCellRetry \$\{key\}/);
assert.match(runtimeService, /\bretrySpecialistBatchCell\b/);

for (const implementationPath of [
  'src/runtime/specialist-cell-retries.js',
  'src/execution/specialist-cell-retry-coordinator.js',
  'scripts/smoke-ai-company-specialist-cell-retry.mjs',
  'scripts/smoke-ui-slice-701.mjs',
]) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, implementationPath)),
    true,
    `${implementationPath} must exist after DEC-182`,
  );
}

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      planningAllowed: true,
      implementationAllowed: true,
      schemaMigrationAllowed: true,
      failedCellRetryAllowed: true,
      activeAttemptRecoveryAllowed: false,
      sourceRecordsRemainImmutable: true,
      planningDecision: 'accepted-dec-180',
      handoffDecision: 'accepted-dec-181',
      implementationDecision: 'accepted-dec-182',
      nextRequiredDecision: 'active specialist attempt recovery decision',
    },
    null,
    2,
  )}\n`,
);
