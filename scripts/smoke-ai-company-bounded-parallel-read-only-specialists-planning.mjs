import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-bounded-parallel-read-only-specialists-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const plan = read('docs/119_ai-company-bounded-parallel-read-only-specialists-plan.md');
const handoff = read(
  'docs/120_ai-company-specialist-batch-preview-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const blueprint = JSON.parse(read('company/blueprint.json'));
const blueprintLoader = read('src/runtime/company-blueprint.js');
const staffingPlans = read('src/runtime/staffing-plans.js');
const contracts = read('src/runtime/contracts.js');
const scheduler = read('src/runtime/work-order-attempts.js');
const specialistBatchPreview = read('src/runtime/specialist-batch-preview.js');

assert.match(plan, /^# AI Company Bounded Parallel Read-Only Specialists Plan$/m);
assert.match(
  plan,
  /operator-decision-ai-company-bounded-parallel-read-only-specialists-planning-001/,
);
assert.match(plan, /approve-ai-company-bounded-parallel-read-only-specialists-planning-only/);
assert.match(plan, /`DEC-173` accepts planning only/);
assert.match(plan, /`DEC-175` closes the implementation-readiness gaps/);
assert.match(plan, /Stage 4A/);
assert.match(plan, /Stage 4B/);
assert.match(plan, /Stage 4C/);
assert.match(plan, /schema v19/);
assert.match(plan, /`WorkOrderAttempt` remains the single-active sequential/);
assert.match(plan, /research-source-evidence/);
assert.match(plan, /verify-plan-evidence/);
assert.match(plan, /agent-researcher/);
assert.match(plan, /agent-qa/);
assert.match(plan, /maxConcurrentCells=2/);
assert.match(plan, /`maxAttempts` is exactly `1`/);
assert.match(plan, /retryAllowed=false/);
assert.match(plan, /maxProviderCalls=0/);
assert.match(plan, /300000ms/);
assert.match(plan, /POST \/api\/council-sessions\/:councilSessionId\/specialist-batch-preview/);
assert.match(
  plan,
  /no GET snapshot, list, start, cancel, retry, execution, or persistence\s+endpoint/,
);
assert.match(plan, /raw file bodies, Council transcripts, environment values, credentials, provider payloads/);
assert.match(plan, /`Promise\.all`/);
assert.match(plan, /at most `65536` request bytes/);
assert.match(plan, /`sourceRefs` has exactly these fields/);
assert.match(plan, /`specialistSpec` has exactly `batchDeadlineMs`, `cells`, `maxConcurrentCells`, and/);
assert.match(plan, /Each cell has exactly `agentProfileId`, `cellDeadlineMs`, `cellId`, `evidenceMode`, `inputPaths`/);
assert.match(plan, /at most ten exact `node --check <relative-path>` commands/);
assert.match(
  plan,
  /Each file is capped at 1 MiB and all distinct real targets together are capped at 8 MiB/,
);
assert.match(plan, /checks the regular-file size before reading bytes/);
assert.match(plan, /symlink aliases[\s\S]*count once toward the aggregate cap/);
assert.match(
  plan,
  /companyRuntime\.councilSynthesisDigests[\s\S]*never exposes the preview or raw synthesis/,
);
assert.match(plan, /loadStateSupportedReadonly\(\)/);
assert.match(plan, /zero ExecutionPlans/);
assert.match(plan, /Canonical JSON recursively sorts object keys/);
assert.match(plan, /specialist-batch-preview-\$\{previewDigest\.slice\(0, 16\)\}/);
assert.match(plan, /Nested evidence is also exact/);
assert.match(plan, /`roleSourceDigests` contains exactly two entries in cell order/);
assert.match(plan, /Every `inputPathDigests` entry has exactly `byteLength`, `path`, and `sha256`/);
assert.match(plan, /The Researcher cell has `position=0`, `role=researcher`/);
assert.match(plan, /`blockedActions` is this exact sorted array/);
assert.match(plan, /The success envelope has exactly `generatedAt` and `specialistBatchPreview`/);
assert.match(plan, /`400` for malformed/);
assert.match(plan, /`404` for a missing route source/);
assert.match(plan, /`409` for stale/);
assert.match(plan, /`413` for request or file-byte limits/);
assert.match(plan, /`415` for a non-JSON/);
assert.match(plan, /state\.councilSpecialistBatchDraft/);
assert.match(plan, /state\.councilSpecialistBatchPreview/);
assert.match(plan, /compares state bytes across success and failure/);
assert.match(plan, /same-input identity/);

assert.match(
  handoff,
  /^# AI Company SpecialistBatchPreview Implementation Decision Handoff$/m,
);
assert.match(
  handoff,
  /operator-decision-ai-company-specialist-batch-preview-implementation-001/,
);
assert.match(handoff, /approve-ai-company-specialist-batch-preview-implementation-slice/);
assert.match(handoff, /planning-only `DEC-175` binds its exact contracts/);
assert.match(handoff, /`DEC-176` consumes the valid operator decision/);
for (const field of [
  'targetAuthority',
  'targetSurface',
  'implementationPlanRefs',
  'runtimePath',
  'compatibilityPlanRefs',
  'schemaPlanRefs',
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
assert.match(handoff, /generic approval, broad continuation, and delegated self-approval do not open implementation/i);
assert.match(handoff, /schemaVersion 19/);
assert.match(handoff, /schema-v20 migration/);
assert.match(handoff, /Promise\.all/);
assert.match(handoff, /The exact valid approval was accepted as `DEC-176`/);
assert.match(handoff, /loadStateSupportedReadonly/);
assert.match(handoff, /65536 bytes/);
assert.match(handoff, /councilSpecialistBatchDraft/);
assert.match(handoff, /state-byte equality across success replay and failures/);

for (const decisionId of ['DEC-172', 'DEC-173', 'DEC-174', 'DEC-175', 'DEC-176']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-173[\s\S]*Status: `Accepted`[\s\S]*planning-only[\s\S]*does not authorize.*implementation/i,
);
assert.match(
  decisionLog,
  /### DEC-174[\s\S]*Status: `Accepted`[\s\S]*complete fielded[\s\S]*No implementation authority is recorded/i,
);
assert.match(
  decisionLog,
  /### DEC-175[\s\S]*Status: `Accepted`[\s\S]*planning clarification only[\s\S]*cannot authorize a preview route/i,
);
assert.match(
  decisionLog,
  /### DEC-176[\s\S]*Status: `Accepted`[\s\S]*response-only schema-v19 SpecialistBatchPreview/i,
);

assert.equal(blueprint.defaultStaffingPolicy.parallelSpecialistsAllowed, false);
assert.match(blueprintLoader, /parallelSpecialistsAllowed[\s\S]*BLUEPRINT_STAFFING_POLICY_INVALID/);
assert.match(staffingPlans, /parallel-specialists StaffingPlan is disabled by CompanyBlueprint/);
for (const profileId of ['agent-researcher', 'agent-qa']) {
  const profile = blueprint.agentProfiles.find((candidate) => candidate.id === profileId);
  assert.ok(profile, `${profileId} must remain source-backed`);
  assert.equal(profile.workspacePolicy.mode, 'shared-readonly');
  assert.deepEqual(profile.providerPolicy.allowedModes, ['local-stub']);
  assert.equal(profile.concurrencyLimit, 1);
  assert.deepEqual(profile.toolPolicy.write, []);
  assert.equal(profile.authority.canMutateSource, false);
  assert.equal(profile.authority.canCommit, false);
  assert.equal(profile.authority.canPush, false);
}
assert.match(contracts, /const STATE_SCHEMA_VERSION = 29/);
assert.match(scheduler, /WORK_ORDER_ATTEMPT_STATUS\.ACTIVE/);

assert.match(completionPlan, /### Stage 4A: SpecialistBatchPreview/);
assert.match(completionPlan, /`DEC-175`[\s\S]*readiness gaps/);
assert.match(completionPlan, /`DEC-176` implements the exact response-only slice/);
assert.match(completionPlan, /### Stage 4B: Durable Concurrent First Attempt/);
assert.match(completionPlan, /### Stage 4C: Failed-Cell Retry And Recovery/);
assert.match(masterPlan, /`DEC-175` fixes the exact/);
assert.match(runtimeContract, /planning-only `DEC-175` fixes/);
assert.match(councilProtocol, /`DEC-175` fixes its exact/);
assert.match(deliveryRoadmap, /`DEC-175` fixes its exact implementation-readiness contracts/);
assert.match(inventory, /AI Company bounded parallel read-only specialists planning \| pass/);
assert.match(inventory, /AI Company SpecialistBatchPreview implementation \| pass/);
assert.match(inventory, /AI Company durable SpecialistBatch planning \| pass/);
assert.match(plan, /`DEC-179` implements Stage 4B through the separate schema-v20 decision/);
assert.match(plan, /Planning-only `DEC-180` and handoff-only\s+`DEC-181` define Stage 4C/);
assert.match(readme, /docs\/119_ai-company-bounded-parallel-read-only-specialists-plan\.md/);
assert.match(
  readme,
  /docs\/120_ai-company-specialist-batch-preview-implementation-decision-handoff\.md/,
);
assert.match(readme, /planning-only `DEC-175` fixes the exact request/);
assert.match(readme, /`DEC-176` implements only/);
assert.match(readme, /1011 smoke files/);
assert.match(readme, /716 UI smoke files/);
assert.match(taskLedger, /ai-company-bounded-parallel-read-only-specialists-planning-post-m7-2013/);
assert.match(taskLedger, /ai-company-specialist-batch-preview-readiness-clarification-post-m7-2014/);
assert.match(taskLedger, /ai-company-specialist-batch-preview-implementation-post-m7-2015/);
assert.match(lessons, /preview contract.*actual concurrency.*WorkOrderAttempt/i);
assert.match(lessons, /fielded preview handoff.*nested request keys.*no-write replay evidence/i);
assert.match(
  verification,
  /id: 'ai-company-bounded-parallel-read-only-specialists-planning'/,
);

for (const implementationPath of [
  'src/runtime/specialist-batch-preview.js',
  'scripts/smoke-ai-company-specialist-batch-preview.mjs',
  'scripts/smoke-ui-slice-699.mjs',
]) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, implementationPath)),
    true,
    `${implementationPath} must exist`,
  );
}
assert.match(specialistBatchPreview, /function buildSpecialistBatchPreview/);
assert.doesNotMatch(specialistBatchPreview, /saveState|Promise\.all|fetch\(/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      planningAllowed: true,
      previewImplementationAllowed: true,
      durableSpecialistBatchImplementationAllowed: true,
      schemaMigrationAllowed: true,
      requestScopedConcurrentExecutionAllowed: true,
      broadParallelStaffingPolicyAllowed: false,
      implementationDecision: 'accepted-dec-179',
      nextRequiredDecision:
        'operator-decision-ai-company-rework-plan-acceptance-implementation-001',
    },
    null,
    2,
  )}\n`,
);
