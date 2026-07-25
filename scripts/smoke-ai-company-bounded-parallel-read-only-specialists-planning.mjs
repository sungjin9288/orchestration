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

assert.match(plan, /^# AI Company Bounded Parallel Read-Only Specialists Plan$/m);
assert.match(
  plan,
  /operator-decision-ai-company-bounded-parallel-read-only-specialists-planning-001/,
);
assert.match(plan, /approve-ai-company-bounded-parallel-read-only-specialists-planning-only/);
assert.match(plan, /`DEC-173` accepts planning only/);
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
assert.match(plan, /maxAttemptsPerCell=1/);
assert.match(plan, /retryAllowed=false/);
assert.match(plan, /maxProviderCalls=0/);
assert.match(plan, /300000ms/);
assert.match(plan, /POST \/api\/council-sessions\/:councilSessionId\/specialist-batch-preview/);
assert.match(plan, /no GET snapshot, list, start, cancel, retry, execution, or persistence endpoint/);
assert.match(plan, /raw file bodies, Council transcripts, environment values, credentials, provider payloads/);
assert.match(plan, /`Promise\.all`/);

assert.match(
  handoff,
  /^# AI Company SpecialistBatchPreview Implementation Decision Handoff$/m,
);
assert.match(
  handoff,
  /operator-decision-ai-company-specialist-batch-preview-implementation-001/,
);
assert.match(handoff, /approve-ai-company-specialist-batch-preview-implementation-slice/);
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

for (const decisionId of ['DEC-172', 'DEC-173', 'DEC-174']) {
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
assert.match(contracts, /const STATE_SCHEMA_VERSION = 19/);
assert.match(scheduler, /WORK_ORDER_ATTEMPT_STATUS\.ACTIVE/);

assert.match(completionPlan, /### Stage 4A: SpecialistBatchPreview/);
assert.match(completionPlan, /### Stage 4B: Durable Concurrent First Attempt/);
assert.match(completionPlan, /### Stage 4C: Failed-Cell Retry And Recovery/);
assert.match(masterPlan, /Stage 4A SpecialistBatchPreview implementation decision/);
assert.match(runtimeContract, /Stage 4A SpecialistBatchPreview implementation decision/);
assert.match(councilProtocol, /Stage 4A SpecialistBatchPreview implementation decision/);
assert.match(deliveryRoadmap, /Stage 4A[\s\S]*SpecialistBatchPreview[\s\S]*implementation decision/);
assert.match(inventory, /AI Company bounded parallel read-only specialists planning \| pass/);
assert.match(readme, /docs\/119_ai-company-bounded-parallel-read-only-specialists-plan\.md/);
assert.match(
  readme,
  /docs\/120_ai-company-specialist-batch-preview-implementation-decision-handoff\.md/,
);
assert.match(readme, /958 smoke files/);
assert.match(readme, /698 UI smoke files/);
assert.match(readme, /informational `276\/276`, total `277\/277`/);
assert.match(taskLedger, /ai-company-bounded-parallel-read-only-specialists-planning-post-m7-2013/);
assert.match(lessons, /preview contract.*actual concurrency.*WorkOrderAttempt/i);
assert.match(
  verification,
  /id: 'ai-company-bounded-parallel-read-only-specialists-planning'/,
);

for (const futurePath of [
  'src/runtime/specialist-batch-preview.js',
  'scripts/smoke-ai-company-specialist-batch-preview.mjs',
  'scripts/smoke-ui-slice-699.mjs',
]) {
  assert.equal(fs.existsSync(path.join(repoRoot, futurePath)), false, `${futurePath} must not exist`);
}

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      planningAllowed: true,
      implementationAllowed: false,
      schemaMigrationAllowed: false,
      actualParallelExecutionAllowed: false,
      nextRequiredDecision:
        'operator-decision-ai-company-specialist-batch-preview-implementation-001',
    },
    null,
    2,
  )}\n`,
);
