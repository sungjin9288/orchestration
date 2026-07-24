import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-multi-agent-completion-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const plan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const handoff = read(
  'docs/114_ai-company-durable-staffing-plan-implementation-decision-handoff.md',
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
const blueprint = JSON.parse(read('company/blueprint.json'));
const councilSessions = read('src/runtime/council-sessions.js');
const compiler = read('src/runtime/mission-workorder-compiler.js');
const continuation = read('src/runtime/execution-continuation-preview.js');
const staffingPlans = read('src/runtime/staffing-plans.js');

assert.match(plan, /^# AI Company Multi-Agent Completion Plan$/m);
assert.match(plan, /operator-decision-ai-company-multi-agent-completion-planning-001/);
assert.match(plan, /approve-ai-company-multi-agent-completion-planning-only/);
assert.match(plan, /## Completion Sequence/);
assert.match(plan, /### Stage 1: Durable StaffingPlan/);
assert.match(plan, /### Stage 3: Operator-Stepped WorkOrder Scheduler/);
assert.match(plan, /### Stage 4: Bounded Parallel Read-Only Specialists/);
assert.match(plan, /### Stage 5: Reviewer Rework/);
assert.match(plan, /### Stage 6: Ops Supervision And Recovery/);
assert.match(plan, /### Stage 7: Reviewed Mission Context Attachment/);
assert.match(plan, /### Stage 8: Provider Expansion And Dogfood/);
assert.match(plan, /atomic schema-v16 to schema-v17 migration/);
assert.match(plan, /parallel-specialists.*rejected while/s);
assert.match(plan, /providerMode: local-stub/);
assert.doesNotMatch(plan, /requiredCapabilities/);
assert.match(plan, /blueprintDigest/);
assert.match(plan, /nine AgentProfile role sources/);
assert.match(plan, /including Conductor/);
assert.match(plan, /the same staffingSpec and preview tuple/);
assert.match(plan, /acknowledgement: reviewed-exact-staffing-plan-for-local-record/);
assert.match(plan, /blockedActions\[\]/);
assert.match(plan, /sequences\.staffingPlan/);
assert.match(plan, /Reject schema v18\+/);
assert.match(plan, /stop before Council or execution/);
assert.match(plan, /planning-only `DEC-163`/);
assert.match(plan, /handoff is recorded as `DEC-164`/);
assert.match(plan, /clarification is recorded as `DEC-165`/);
assert.match(plan, /implementation is recorded as `DEC-166`/);

assert.match(
  handoff,
  /^# AI Company Durable StaffingPlan Implementation Decision Handoff$/m,
);
assert.match(
  handoff,
  /operator-decision-ai-company-durable-staffing-plan-implementation-001/,
);
assert.match(handoff, /approve-ai-company-durable-staffing-plan-implementation-slice/);
assert.match(handoff, /schema-v17 immutable accepted StaffingPlan/);
assert.match(handoff, /providerMode=local-stub/);
assert.match(handoff, /maxProviderCalls=0/);
assert.match(handoff, /src\/runtime\/company-blueprint\.js/);
assert.match(handoff, /src\/runtime\/staffing-plans\.js/);
assert.match(handoff, /scripts\/smoke-ui-slice-696\.mjs/);
assert.match(handoff, /sequences\.staffingPlan/);
assert.match(handoff, /future schema 17 becomes 18/);
assert.match(handoff, /reviewed-exact-staffing-plan-for-local-record/);
assert.match(handoff, /same staffingSpec and evaluatedAt/);
assert.match(handoff, /with source refs acceptance blockedActions and recordDigest/);
assert.match(handoff, /company\/roles\/conductor\.md/);
assert.match(handoff, /company\/roles\/ops\.md/);
assert.doesNotMatch(handoff, /providerMode=local-stub-only/);
assert.match(handoff, /delegated self-approval for schema migration or durable record creation/);
assert.match(handoff, /implementation is accepted as `DEC-166`/);

for (const decisionId of ['DEC-162', 'DEC-163', 'DEC-164', 'DEC-165', 'DEC-166']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}

assert.match(masterPlan, /## Accepted Multi-Agent Completion Planning Authority/);
assert.match(masterPlan, /`DEC-163`, `DEC-164`, `DEC-165`, `DEC-166`/);
assert.match(runtimeContract, /Multi-agent completion source reconciliation은 `DEC-162`/);
assert.match(runtimeContract, /implementation-readiness\s+clarification은 `DEC-165`/);
assert.match(councilProtocol, /Multi-agent completion source reconciliation은 `DEC-162`/);
assert.match(councilProtocol, /clarification은 `DEC-165`/);
assert.match(deliveryRoadmap, /## VNext Multi-Agent Completion Sequence/);
assert.match(deliveryRoadmap, /readiness clarification은 `DEC-165`/);
assert.match(inventory, /AI Company multi-agent completion planning \| pass/);
assert.match(inventory, /`DEC-162`, `DEC-163`, `DEC-164`, `DEC-165`, `DEC-166`/);
assert.match(readme, /docs\/113_ai-company-multi-agent-completion-plan\.md/);
assert.match(
  readme,
  /docs\/114_ai-company-durable-staffing-plan-implementation-decision-handoff\.md/,
);
assert.match(readme, /Durable StaffingPlan.*schema-v17.*implemented/s);
assert.match(taskLedger, /ai-company-multi-agent-completion-planning-post-m7-2006/);
assert.match(
  taskLedger,
  /ai-company-durable-staffing-plan-readiness-clarification-post-m7-2007/,
);
assert.match(
  lessons,
  /A Council `staffingSnapshot` is execution context, not an operator-accepted durable StaffingPlan/,
);
assert.match(
  lessons,
  /An implementation handoff is not decision-complete when its nouns do not exist/,
);
assert.match(verification, /id: 'ai-company-multi-agent-completion-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-multi-agent-completion-planning\.mjs'/,
);
assert.match(verification, /script: 'scripts\/smoke-ai-company-durable-staffing-plan\.mjs'/);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 17/);
assert.equal(blueprint.defaultStaffingPolicy.parallelSpecialistsAllowed, false);
assert.equal(
  blueprint.agentProfiles.every((profile) => profile.concurrencyLimit === 1),
  true,
);
assert.match(councilSessions, /staffingSnapshot:/);
assert.match(compiler, /const REQUIRED_WORK_ORDER_ROLES = \['builder', 'reviewer', 'qa'\]/);
assert.match(continuation, /maxSteps must be exactly 1/);
assert.match(continuation, /backgroundSchedulingAllowed: false/);
assert.match(staffingPlans, /function previewMissionStaffingPlan/);
assert.match(staffingPlans, /function createStaffingPlan/);
assert.equal(fs.existsSync(path.join(repoRoot, 'src/runtime/staffing-plans.js')), true);
assert.equal(fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-696.mjs')), true);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      decisions: {
        reconciliation: 'accepted-dec-162',
        planning: 'accepted-dec-163',
        handoff: 'documented-dec-164',
        clarification: 'accepted-dec-165',
        implementation: 'accepted-dec-166',
      },
      currentRuntime: {
        schemaVersion: 17,
        councilStaffingSnapshot: true,
        durableStaffingPlan: true,
        fixedWorkOrderRoles: ['builder', 'reviewer', 'qa'],
        parallelSpecialistsEnabled: false,
        continuationMaxSteps: 1,
      },
      firstImplementationTarget: {
        schemaVersion: 17,
        object: 'StaffingPlan',
        flow: 'preview-separate-accept-atomic-append-exact-inspection',
        councilBinding: false,
        scheduling: false,
      },
      authority: {
        documentationAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: true,
        durableRecordAllowed: true,
        councilBindingAllowed: false,
        schedulingAllowed: false,
        parallelExecutionAllowed: false,
        providerExpansionAllowed: false,
        memoryApplicationAllowed: false,
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
