import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-durable-specialist-batch-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertHasAll(text, patterns) {
  for (const pattern of patterns) {
    assert.match(text, pattern);
  }
}

const plan = read('docs/121_ai-company-durable-specialist-batch-plan.md');
const handoff = read(
  'docs/122_ai-company-durable-specialist-batch-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const stage4Plan = read('docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const fileStore = read('src/runtime/file-store.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const uiSignals = read('ui/council-signals.js');
const uiApp = read('ui/app.js');
const uiStyles = read('ui/styles.css');
const blueprint = JSON.parse(read('company/blueprint.json'));
const blueprintLoader = read('src/runtime/company-blueprint.js');

assertHasAll(plan, [
  /^# AI Company Durable Specialist Batch Plan$/m,
  /operator-decision-ai-company-durable-specialist-batch-planning-001/,
  /approve-ai-company-durable-specialist-batch-planning-only/,
  /`DEC-177` records this planning-only boundary/,
  /`DEC-178` records the complete fielded implementation/,
  /reserved for `DEC-179`/,
  /`parallelSpecialistsAllowed=false` remains authoritative/,
  /This is not a reusable policy exception/,
  /sequences\.specialistBatch/,
  /sequences\.specialistCellAttempt/,
  /^specialistBatches$/m,
  /^specialistCellAttempts$/m,
  /Status is `active`,\s+`completed`, `partial-failed`, or `failed`/,
  /Status is `active`, `completed`, or `failed`/,
  /^executionApproval$/m,
  /^batchDeadlineMs$/m,
  /^inputPathDigests$/m,
  /^observedInputDigest$/m,
  /^cellDeadlineMs$/m,
  /Every\s+entry has exactly `byteLength`, `path`, and `sha256`/,
  /allowing validators and exact GET consumers to recompute the expected evidence/,
  /`executionApprovalDigest` covers\s+that complete object/,
  /POST \/api\/council-sessions\/:councilSessionId\/specialist-batches/,
  /GET \/api\/specialist-batches\/:specialistBatchId/,
  /GET \/api\/council-sessions\/:councilSessionId\/specialist-batch\n  \?staffingEntryId=:staffingEntryId\n  &currentAttemptId=:currentAttemptId/,
  /The body has exactly these eight keys:[\s\S]*compileSpec\n[\s\S]*evaluatedAt\n[\s\S]*executionApproval\n[\s\S]*previewDigest\n[\s\S]*previewId\n[\s\S]*sourceDigest\n[\s\S]*sourceRefs\n[\s\S]*specialistSpec/,
  /Canonical\s+normalization and digest input use the order above/,
  /decision=start-first-attempt/,
  /acknowledgement=execute-exact-readonly-specialist-batch-once/,
  /rationale[\s\S]*reviewedAt/,
  /first successful POST returns `201`; exact replay returns `200`/,
  /Both success bodies have exactly:[\s\S]*generatedAt\nidempotent\nspecialistBatch\nspecialistCellAttempts/,
  /Exact GET returns `200` with exactly:[\s\S]*generatedAt\nspecialistBatch\nspecialistCellAttempts/,
  /Malformed, missing, oversized, unsupported-content, stale-before-write, and exact-GET-not-found[\s\S]*`400`, `404`, `409`, `413`, or `415`/,
  /failures return only `\{error\}`/,
  /settlement CAS conflict[\s\S]*`{error, specialistBatchId}`/,
  /saves the migration and all three active records in one CAS write/,
  /revalidate[\s\S]*active attempt's exact `inputDigest` after the active save/,
  /source-drift-before-worker/,
  /source-drift-during-worker/,
  /Researcher and QA start in the same request without awaiting one before starting the other/,
  /Each worker completion enters one request-local settlement queue/,
  /reloads the latest schema-v20 state/,
  /must not automatically retry a CAS\s+conflict/,
  /remains active and inspectable for a later\s+separately authorized recovery decision/,
  /failed queue item must not poison the queue tail/,
  /first completion may leave that cell active[\s\S]*second completion still settles durably/,
  /kind=source-evidence-manifest/,
  /kind=node-syntax-check/,
  /maxProviderCalls=0/,
  /batch\.deadlineAt = startedAt \+ batchDeadlineMs/,
  /cell\.deadlineAt = min\(startedAt \+ cellDeadlineMs, batch\.deadlineAt\)/,
  /batch stores\s+`batchDeadlineMs`; each cell stores its matching `cellDeadlineMs`/,
  /Validators recompute both equations after reload/,
  /deadline-expired-before-worker/,
  /runner-contract-failed/,
  /valid QA syntax-check result[\s\S]*completed evidence result[\s\S]*not\s+a runner failure/,
  /`completed`\s+when both cells completed[\s\S]*`partial-failed` when exactly one completed and one failed[\s\S]*`failed`\s+when both failed/,
  /Researcher checks the remaining deadline before each bounded file read/,
  /Internal QA subprocess\s+termination after timeout or output-cap breach is safety\s+enforcement/,
  /There is no cancel route or cancel status/,
  /generic `\/api\/snapshot` projection\s+explicitly omits `specialistBatches` and `specialistCellAttempts`/,
  /locator requires exactly those two query keys/,
  /validates all three ids against the current\s+Council and bound StaffingEntry source chain/,
  /Missing input is `400`, no matching batch is `404`, and a stale\s+current chain is `409`/,
  /returns at most that chain's one immutable batch/,
  /It is not a collection projection/,
  /no raw source, output body, absolute path, raw error, credential, transcript, provider payload/i,
  /`DEC-179` consumes the exact complete approval/,
]);

for (const failureReason of [
  'deadline-expired-before-worker',
  'cell-deadline-exceeded',
  'source-drift-before-worker',
  'source-drift-during-worker',
  'source-unavailable-after-start',
  'source-byte-cap-exceeded-after-start',
  'qa-spawn-failed',
  'qa-output-cap-exceeded',
  'runner-contract-failed',
]) {
  assert.match(plan, new RegExp(`^${failureReason}$`, 'm'));
}

assert.match(
  handoff,
  /^# AI Company Durable Specialist Batch Implementation Decision Handoff$/m,
);
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
  /decisionId=operator-decision-ai-company-durable-specialist-batch-implementation-001/,
  /decisionStatus=approve-ai-company-durable-specialist-batch-implementation-slice/,
  /one deterministic local schema-v20 durable SpecialistBatch and exactly two SpecialistCellAttempt records/,
  /parallelSpecialistsAllowed=false/,
  /exact eight-key bounded JSON request/,
  /persist one active batch plus two active first attempts with bounded normalized executionApproval exact inputPathDigests durable batchDeadlineMs and per-cell cellDeadlineMs before worker invocation/,
  /derive and reload-validate exact batch and cell deadlineAt values from one startedAt/,
  /revalidate worker input digests after the active save/,
  /start the fixed Researcher and QA local workers concurrently/,
  /one failure-isolated serial fresh-state CAS writer/,
  /continues after a prior conflict without retrying it/,
  /observed input digests/,
  /allowlisted failure codes/,
  /derive the exact active completed partial-failed or failed batch status/,
  /return the exact POST exact-id GET bounded current-chain GET and conflict envelopes/,
  /omit both durable maps from generic snapshot/,
  /never rerun or infer success for an active interrupted cell/,
  /add schemaVersion 20 plus only specialistBatch and specialistCellAttempt sequences and maps/,
  /scripts\/smoke-ui-slice-700\.mjs/,
  /`DEC-179` is consumed/,
]);

for (const decisionId of ['DEC-176', 'DEC-177', 'DEC-178', 'DEC-179']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-177[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, schema, API, UI/,
);
assert.match(
  decisionLog,
  /### DEC-178[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*reserved for `DEC-179`/,
);

for (const text of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
  readme,
]) {
  assert.match(text, /DEC-177/);
  assert.match(text, /DEC-178/);
  assert.match(text, /DEC-179/);
}
assert.match(stage4Plan, /`DEC-179` implements Stage 4B through the separate schema-v20 decision/);
assert.match(
  masterPlan,
  /`DEC-179` implements\s+only that exact fixed local first attempt/,
);
assert.match(inventory, /AI Company durable SpecialistBatch planning \| pass/);
assert.match(readme, /docs\/121_ai-company-durable-specialist-batch-plan\.md/);
assert.match(
  readme,
  /docs\/122_ai-company-durable-specialist-batch-implementation-decision-handoff\.md/,
);
assert.match(
  taskLedger,
  /ai-company-durable-specialist-batch-planning-post-m7-2016/,
);
assert.match(
  lessons,
  /fixed post-Council evidence batch[\s\S]*parallel-specialists` StaffingPlan policy/i,
);
assert.match(
  lessons,
  /active batch and both cells[\s\S]*serial fresh-state CAS settlement/i,
);
assert.match(
  lessons,
  /exact-id inspection does not by itself support hard-refresh recovery[\s\S]*keep the new durable maps out of that snapshot/i,
);
assert.match(
  verification,
  /id: 'ai-company-durable-specialist-batch-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-durable-specialist-batch-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 22/);
assert.match(contracts, /specialistBatch/);
assert.match(contracts, /specialistCellAttempt/);
assert.match(decisionLog, /^### DEC-179$/m);
assert.match(fileStore, /\bspecialistBatches\b/);
assert.match(fileStore, /\bspecialistCellAttempts\b/);
assert.match(runtimeService, /\bstartCouncilSpecialistBatch\b/);
assert.match(runtimeService, /\bgetSpecialistBatch\b/);
assert.match(runtimeService, /\bgetCurrentCouncilSpecialistBatch\b/);
assert.match(server, /\/specialist-batches/);
assert.match(server, /\/specialist-batch/);
assert.doesNotMatch(uiSignals, /\bdurableSpecialistBatch\b/);
assert.match(uiApp, /\bcouncilSpecialistBatch\b/);
assert.match(uiStyles, /\.specialist-batch-durable\b/);
assert.equal(blueprint.defaultStaffingPolicy.defaultMode, 'council');
assert.equal(blueprint.defaultStaffingPolicy.parallelSpecialistsAllowed, false);
assert.match(
  blueprintLoader,
  /parallelSpecialistsAllowed[\s\S]*BLUEPRINT_STAFFING_POLICY_INVALID/,
);
assertHasAll(fileStore, [
  /const STATE_REVISION = Symbol\('orchestration\.stateRevision'\)/,
  /StateLockTimeoutError/,
  /fs\.fsyncSync/,
  /fs\.renameSync/,
  /StateConflictError/,
]);

for (const implementationPath of [
  'src/runtime/specialist-batches.js',
  'src/runtime/specialist-cell-attempts.js',
  'src/execution/specialist-batch-coordinator.js',
  'src/execution/specialist-researcher-local-runner.js',
  'scripts/smoke-ai-company-durable-specialist-batch.mjs',
  'scripts/smoke-ui-slice-700.mjs',
]) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, implementationPath)),
    true,
    `${implementationPath} must exist after accepted DEC-179 implementation`,
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
      actualConcurrentExecutionAllowed: true,
      parallelSpecialistsPolicyChangeAllowed: false,
      implementationDecision: 'accepted-dec-179',
      nextRequiredDecision:
        'operator-decision-ai-company-ops-supervision-preview-implementation-001',
    },
    null,
    2,
  )}\n`,
);
