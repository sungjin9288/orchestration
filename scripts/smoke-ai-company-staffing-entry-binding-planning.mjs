import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-staffing-entry-binding-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const plan = read('docs/115_ai-company-staffing-entry-binding-plan.md');
const handoff = read(
  'docs/116_ai-company-staffing-entry-binding-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const staffingEntries = read('src/runtime/staffing-entries.js');
const staffingPlans = read('src/runtime/staffing-plans.js');
const councilSessions = read('src/runtime/council-sessions.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const app = read('ui/app.js');

assert.match(plan, /^# AI Company Accepted StaffingPlan Council Entry Binding Plan$/m);
assert.match(
  plan,
  /operator-delegated-ai-company-staffing-entry-binding-planning-001/,
);
assert.match(plan, /approve-ai-company-staffing-entry-binding-planning-only/);
assert.match(plan, /Introduce one immutable `StaffingEntry` audit record/);
assert.match(plan, /## Why Council First/);
assert.match(plan, /no executable solo runtime exists/);
assert.match(plan, /Schema v18 adds only:/);
assert.match(plan, /sequences\.staffingEntry/);
assert.match(plan, /Mission\.staffingEntryId: string \| null/);
assert.match(plan, /entryKind: real-council/);
assert.match(plan, /decision: enter/);
assert.match(
  plan,
  /acknowledgement: bind-exact-accepted-staffing-plan-to-local-council/,
);
assert.match(plan, /entryApprovalDigest = sha256/);
assert.match(plan, /entrySourceDigest = sha256/);
assert.match(plan, /recordDigest = sha256/);
assert.match(plan, /run exactly one existing deterministic local-stub Council attempt/i);
assert.match(plan, /Require the result to reach `awaiting-alignment`/);
assert.match(plan, /Atomically save schema migration, StaffingEntry, CouncilSession/);
assert.match(plan, /`approve` persists Council alignment and Mission `aligned` only/);
assert.match(plan, /`request-revision` is rejected/);
assert.match(plan, /`resume` is rejected/);
assert.match(plan, /never calls `runMissionAlignmentAutoChain`/);
assert.match(plan, /POST \/api\/staffing-plans\/:staffingPlanId\/council-entry/);
assert.match(plan, /GET  \/api\/staffing-entries\/:staffingEntryId/);
assert.match(plan, /409 STAFFING_PLAN_ENTRY_REQUIRED/);
assert.match(plan, /solo runtime not implemented/);
assert.match(plan, /Planning-only authority is recorded as `DEC-167`/);
assert.match(plan, /complete fielded implementation handoff is\s+recorded as `DEC-168`/);

assert.match(
  handoff,
  /^# AI Company StaffingEntry Council Binding Implementation Decision Handoff$/m,
);
assert.match(
  handoff,
  /operator-decision-ai-company-staffing-entry-council-binding-implementation-001/,
);
assert.match(
  handoff,
  /approve-ai-company-staffing-entry-council-binding-implementation-slice/,
);
assert.match(handoff, /schema-v18 immutable StaffingEntry binding/);
assert.match(handoff, /src\/runtime\/staffing-entries\.js/);
assert.match(handoff, /scripts\/smoke-ui-slice-697\.mjs/);
assert.match(handoff, /schemaVersion 18 sequences\.staffingEntry staffingEntries/);
assert.match(handoff, /future schema 18 becomes 19/);
assert.match(
  handoff,
  /bind-exact-accepted-staffing-plan-to-local-council/,
);
assert.match(handoff, /bound Council approve as alignment-only or stop/);
assert.match(handoff, /delegated self-approval for schema migration/);
assert.match(handoff, /solo lifecycle state is fabricated/);
assert.match(handoff, /retain exact GET inspection for valid schema-v18 evidence/);
assert.match(
  handoff,
  /scripts\/smoke-ai-company-staffing-entry-binding-planning\.mjs/,
);

for (const decisionId of ['DEC-167', 'DEC-168', 'DEC-169']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-167[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, schema, API, UI, provider, source, Git, scheduler, policy, bypass, or connector behavior/,
);
assert.match(
  decisionLog,
  /### DEC-168[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*does not authorize schema, runtime, API, UI, durable entry, or Council mutation/,
);
assert.match(
  decisionLog,
  /### DEC-169[\s\S]*Status: `Accepted`[\s\S]*schema-v18[\s\S]*StaffingEntry[\s\S]*alignment-only/,
);

assert.match(masterPlan, /Council-first\s+StaffingEntry binding is implemented as `DEC-169`/);
assert.match(runtimeContract, /schema-v18 StaffingEntry implementation/);
assert.match(councilProtocol, /Bound StaffingEntry sessions/);
assert.match(deliveryRoadmap, /StaffingEntry\s+implementation is accepted as `DEC-169`/);
assert.match(inventory, /AI Company StaffingEntry Council binding implementation \| pass/);
assert.match(readme, /docs\/115_ai-company-staffing-entry-binding-plan\.md/);
assert.match(
  readme,
  /docs\/116_ai-company-staffing-entry-binding-implementation-decision-handoff\.md/,
);
assert.match(taskLedger, /ai-company-staffing-entry-binding-planning-post-m7-2009/);
assert.match(
  lessons,
  /Do not advance a Mission lifecycle for an inert staffing mode when no executable role contract exists/,
);
assert.match(verification, /id: 'ai-company-staffing-entry-binding-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-staffing-entry-binding-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 19/);
assert.match(contracts, /staffingEntries: \{\}/);
assert.match(staffingEntries, /function createStaffingEntry/);
assert.match(staffingEntries, /function assertStaffingEntryRecord/);
assert.match(staffingPlans, /'solo', 'council', 'parallel-specialists'/);
assert.match(staffingPlans, /'council-start'/);
assert.match(councilSessions, /staffingSnapshot:/);
assert.match(councilSessions, /staffingEntryRef = null/);
assert.match(councilSessions, /session\.staffingEntryRef = cloneJson\(staffingEntryRef\)/);
assert.match(runtimeService, /function enterStaffingPlanCouncil\(input\)/);
assert.match(runtimeService, /function getStaffingEntry\(staffingEntryId\)/);
assert.match(runtimeService, /function startRealCouncilForMission\(input\)/);
assert.match(runtimeService, /STAFFING_PLAN_ENTRY_REQUIRED/);
assert.match(runtimeService, /STAFFING_ENTRY_ACTION_BLOCKED/);
assert.match(
  server,
  /runtime\.enterStaffingPlanCouncil\(\{\s*\.\.\.input,\s*staffingPlanId,\s*\}\)/,
);
assert.match(server, /runtime\.getStaffingEntry\(staffingEntryId\)/);
assert.match(
  app,
  /async function enterStaffingPlanCouncil\(actionButton\)[\s\S]*\/api\/staffing-plans\/\$\{encodeURIComponent\(staffingPlan\.id\)\}\/council-entry/,
);
assert.match(
  plan,
  /no operator-facing\s+route or public runtime method may create a new unbound local-stub session/,
);
assert.match(
  handoff,
  /block every new operator-facing or public-runtime unbound real-local-stub start/,
);
assert.match(plan, /scripts\/smoke-ai-company-staffing-entry-binding-planning\.mjs/);
assert.match(plan, /must not be deleted, deregistered, or weakened/);
assert.doesNotMatch(runtimeService, /function startSolo/);
assert.equal(fs.existsSync(path.join(repoRoot, 'src/runtime/staffing-entries.js')), true);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-staffing-entry-binding.mjs')),
  true,
);
assert.equal(fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-697.mjs')), true);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      decisions: {
        planning: 'accepted-dec-167',
        handoff: 'documented-dec-168',
        implementation: 'accepted-dec-169',
        operatorSteppedScheduler: 'accepted-dec-172',
      },
      currentRuntime: {
        schemaVersion: 19,
        durableStaffingPlan: true,
        staffingEntry: true,
        acceptedPlanBoundToCouncil: true,
        soloRuntime: false,
        boundCouncilAutoChainBlocked: true,
        operatorSteppedScheduler: true,
      },
      implementedSlice: {
        schemaVersion: 18,
        object: 'StaffingEntry',
        entryKind: 'real-council',
        providerMode: 'local-stub',
        oneAttemptBeforeSave: true,
        boundApprove: 'alignment-only',
        soloEntry: false,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: true,
        durableEntryAllowed: true,
        councilBindingAllowed: true,
        soloExecutionAllowed: false,
        operatorSteppedSchedulingAllowed: true,
        generalSchedulingAllowed: false,
        boundWorkOrderAllowed: true,
        providerExpansionAllowed: false,
        sourceMutationExpansionAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
        releaseAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
