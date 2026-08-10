import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-ops-supervision-preview-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertHasAll(text, patterns) {
  for (const pattern of patterns) assert.match(text, pattern);
}

const plan = read('docs/125_ai-company-ops-supervision-preview-plan.md');
const handoff = read(
  'docs/126_ai-company-ops-supervision-preview-implementation-decision-handoff.md',
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
const runtimeService = read('src/runtime/runtime-service.js');

assertHasAll(plan, [
  /^# AI Company Ops Supervision Preview Plan$/m,
  /operator-delegated-ai-company-ops-supervision-preview-planning-001/,
  /approve-ai-company-ops-supervision-preview-planning-only/,
  /planning authority is recorded as `DEC-183`/,
  /implementation handoff is\s+recorded separately as `DEC-184`/,
  /implementation was reserved for an exact\s+`DEC-185` decision/,
  /^## Implemented Status$/m,
  /`DEC-185` accepted the exact complete 15-field implementation decision/,
  /response-only\s+`OpsSupervisionPreview`/,
  /schema v21/,
  /^work-order-attempt$/m,
  /^specialist-first-attempt$/m,
  /^specialist-retry-attempt$/m,
  /one exact active `WorkOrderAttempt`/,
  /attemptNumber=1/,
  /attemptNumber=2/,
  /GET \/api\/ops\/supervision-preview/,
  /All six query keys are required exactly once/,
  /expectedTargetRecordDigest/,
  /expectedParentDigest/,
  /computeExecutionPlanRecordDigest\(\)/,
  /^parentDigest$/m,
  /must not precede the target\s+`startedAt`/,
  /more than five minutes ahead of the runtime clock/,
  /evaluatedAt=deadlineAt/,
  /not a collection, list, history, search, ranking, recommendation/,
  /Transport returns `200`/,
  /`400` for malformed or unsupported query input/,
  /`404` for an unknown exact target or parent/,
  /`409` for terminal, stale digest/,
  /^schemaVersion$/m,
  /^allowedActions$/m,
  /^blockedActions$/m,
  /schemaVersion=21/,
  /persisted=false/,
  /status=supervision-required/,
  /allowedActions=\[\]/,
  /active-without-deadline/,
  /active-within-deadline/,
  /active-deadline-exceeded/,
  /lineageClassification` is `source-bound`/,
  /evidenceRefs` has exactly these keys/,
  /^executionPlanRef$/m,
  /^sourceAttemptRef$/m,
  /`blockedActions` is the exact ordered array/,
  /^settle-attempt$/m,
  /^enumerate-attempts$/m,
  /canonical key-sorted JSON/,
  /ops-supervision-preview-\$\{previewDigest\.slice\(0, 16\)\}/,
  /Raw source, prompt,\s+provider payload, stdout, stderr/,
  /Inspect active attempt/,
  /must not show `Retry`, `Resume`, `Cancel`, `Quarantine`, `Settle`/,
  /Keep `STATE_SCHEMA_VERSION=21`/,
  /do not edit `createEmptyState`, file-store normalization/,
  /Create no approval, Decision Inbox item, Run, Artifact, WorkflowCheckpoint/,
  /src\/runtime\/ops-supervision-preview\.js/,
  /scripts\/smoke-ui-slice-702\.mjs/,
  /accepted and\s+consumed as `DEC-185`/,
  /Schema-v22 migration, durable Ops records, active-attempt settlement/,
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
  /^# AI Company Ops Supervision Preview Implementation Decision Handoff$/m,
  /Planning-only decision: accepted as `DEC-183`/,
  /Implementation handoff: recorded as `DEC-184`/,
  /reserved for `DEC-185`/,
  /decisionId=operator-decision-ai-company-ops-supervision-preview-implementation-001/,
  /decisionStatus=approve-ai-company-ops-supervision-preview-implementation-slice/,
  /schema-v21-preserving response-only OpsSupervisionPreview/,
  /exact six-key GET query/,
  /expectedTargetRecordDigest expectedParentDigest/,
  /canonical ExecutionPlan digest/,
  /no-migration read path/,
  /allowedActions empty/,
  /do not edit createEmptyState file-store normalization migrations sequences maps/,
  /zero state source worker provider approval inbox run artifact checkpoint Git release memory or policy mutation/,
  /scripts\/smoke-ui-slice-702\.mjs/,
  /schema-v22 migration, durable Ops supervision recovery disposition/,
  /does not approve schema migration durable recovery records settlement cancellation/,
  /exact valid approval outcome was supplied and recorded as `DEC-185`/,
  /implementation gate is\s+consumed/,
]);

for (const decisionId of ['DEC-182', 'DEC-183', 'DEC-184', 'DEC-185']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-183[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*no runtime, API, UI, schema/,
);
assert.match(
  decisionLog,
  /### DEC-184[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*reserved for `DEC-185`/,
);
assert.match(
  decisionLog,
  /### DEC-185[\s\S]*Status: `Accepted`[\s\S]*schema-v21-preserving response-only `OpsSupervisionPreview`[\s\S]*allowedActions=\[\]/,
);

for (const text of [
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
  readme,
]) {
  assert.match(text, /DEC-183/);
  assert.match(text, /DEC-184/);
  assert.match(text, /DEC-185/);
}

assert.match(inventory, /AI Company OpsSupervisionPreview planning \| pass/);
assert.match(inventory, /AI Company OpsSupervisionPreview implementation \| pass/);
assert.match(readme, /docs\/125_ai-company-ops-supervision-preview-plan\.md/);
assert.match(
  readme,
  /docs\/126_ai-company-ops-supervision-preview-implementation-decision-handoff\.md/,
);
assert.match(
  taskLedger,
  /ai-company-ops-supervision-preview-implementation-post-m7-2021/,
);
assert.match(
  lessons,
  /active attempt supervision[\s\S]*classification[\s\S]*mutation authority/i,
);
assert.match(
  verification,
  /id: 'ai-company-ops-supervision-preview-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-ops-supervision-preview-planning\.mjs'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-ops-supervision-preview\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 28/);
assert.doesNotMatch(contracts, /opsSupervisionPreview/);
assert.match(runtimeService, /\bgetOpsSupervisionPreview\b/);
for (const implementationPath of [
  'src/runtime/ops-supervision-preview.js',
  'scripts/smoke-ai-company-ops-supervision-preview.mjs',
  'scripts/smoke-ui-slice-702.mjs',
]) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, implementationPath)),
    true,
    `${implementationPath} must exist after DEC-185`,
  );
}

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      schemaVersion: 21,
      planningAllowed: true,
      implementationAllowed: true,
      schemaMigrationAllowed: false,
      activeAttemptMutationAllowed: false,
      recoveryActionAllowed: false,
      planningDecision: 'accepted-dec-183',
      handoffDecision: 'accepted-dec-184',
      implementationDecision: 'accepted-dec-185',
      nextRequiredDecision: 'durable-ops-recovery-or-rework-planning',
    },
    null,
    2,
  )}\n`,
);
