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
const durableSpecialistPlan = read('docs/121_ai-company-durable-specialist-batch-plan.md');
const durableSpecialistHandoff = read(
  'docs/122_ai-company-durable-specialist-batch-implementation-decision-handoff.md',
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
assert.match(plan, /### Stage 4A: SpecialistBatchPreview/);
assert.match(plan, /### Stage 4B: Durable Concurrent First Attempt/);
assert.match(plan, /### Stage 4C: Failed-Cell Retry And Recovery/);
assert.match(plan, /Planning-only `DEC-180`/);
assert.match(plan, /`DEC-181` records/);
assert.match(plan, /`DEC-182` implements the schema-v21 path/);
assert.match(plan, /### Stage 5: Reviewer Rework/);
assert.match(plan, /Planning-only `DEC-186`/);
assert.match(plan, /`DEC-187` records its complete fielded implementation handoff/);
assert.match(plan, /`DEC-188` implements only that exact response-only runtime\/API\/UI boundary/);
assert.match(plan, /Planning-only `DEC-189` now fixes Stage 5B/);
assert.match(plan, /`DEC-190` records its complete fielded implementation handoff/);
assert.match(plan, /`DEC-191` implements/);
assert.match(plan, /Planning-only `DEC-192` now fixes Stage 5C/);
assert.match(plan, /`DEC-193` records its complete fielded implementation handoff/);
assert.match(plan, /`DEC-194` implements only the exact accepted evidence append/);
assert.match(plan, /source progress digest/);
assert.match(plan, /allowedActions=\[\]/);
assert.match(plan, /### Stage 6: Ops Supervision And Recovery/);
assert.match(plan, /Stage 6A planning-only `DEC-183`/);
assert.match(plan, /`DEC-184`\s+records the complete fielded implementation handoff/);
assert.match(plan, /`DEC-185` implements only\s+that exact runtime\/API\/UI inspection path/);
assert.match(plan, /allowedActions=\[\]/);
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
assert.match(plan, /scheduler planning is recorded as `DEC-170`/);
assert.match(plan, /implementation handoff is recorded as `DEC-171`/);
assert.match(plan, /implemented as `DEC-172`/);
assert.match(plan, /`DEC-173` accepts planning only/);
assert.match(plan, /`DEC-174` records the fielded implementation handoff/);
assert.match(plan, /`DEC-175`[\s\S]*readiness gaps/);
assert.match(plan, /`DEC-176` implements the exact response-only slice/);
assert.match(plan, /Planning-only `DEC-177` fixes the schema-v20 SpecialistBatch/);
assert.match(plan, /`DEC-178` records the complete fielded implementation handoff/);
assert.match(plan, /`DEC-179` implements the\s+request-scoped first attempt only/);
assert.match(durableSpecialistPlan, /^# AI Company Durable Specialist Batch Plan$/m);
assert.match(
  durableSpecialistHandoff,
  /^# AI Company Durable Specialist Batch Implementation Decision Handoff$/m,
);

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

for (const decisionId of [
  'DEC-162',
  'DEC-163',
  'DEC-164',
  'DEC-165',
  'DEC-166',
  'DEC-167',
  'DEC-168',
  'DEC-169',
  'DEC-170',
  'DEC-171',
  'DEC-172',
  'DEC-173',
  'DEC-174',
  'DEC-175',
  'DEC-176',
  'DEC-177',
  'DEC-178',
  'DEC-179',
  'DEC-180',
  'DEC-181',
  'DEC-182',
  'DEC-183',
  'DEC-184',
  'DEC-185',
  'DEC-186',
  'DEC-187',
  'DEC-188',
  'DEC-189',
  'DEC-190',
  'DEC-191',
  'DEC-192',
  'DEC-193',
  'DEC-194',
]) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}

assert.match(masterPlan, /## Accepted Multi-Agent Completion Planning Authority/);
assert.match(masterPlan, /Recorded decisions: `DEC-163` through `DEC-194`/);
assert.match(runtimeContract, /Multi-agent completion source reconciliation은 `DEC-162`/);
assert.match(runtimeContract, /implementation-readiness\s+clarification은 `DEC-165`/);
assert.match(councilProtocol, /Multi-agent completion source reconciliation은 `DEC-162`/);
assert.match(councilProtocol, /clarification은 `DEC-165`/);
assert.match(deliveryRoadmap, /## VNext Multi-Agent Completion Sequence/);
assert.match(deliveryRoadmap, /readiness clarification은 `DEC-165`/);
assert.match(masterPlan, /Stage 5B planning: `DEC-189`/);
assert.match(runtimeContract, /Planning-only `DEC-189` defines one schema-v22 immutable/);
assert.match(councilProtocol, /Planning-only `DEC-189` and handoff-only `DEC-190`/);
assert.match(deliveryRoadmap, /`DEC-189`[\s\S]*`DEC-190`/);
assert.match(masterPlan, /Stage 5C planning: `DEC-192`/);
assert.match(masterPlan, /Stage 5C implementation: `DEC-194`/);
assert.match(runtimeContract, /Planning-only `DEC-192` defines one schema-v23/);
assert.match(councilProtocol, /Planning-only `DEC-192` and handoff-only `DEC-193`/);
assert.match(deliveryRoadmap, /`DEC-192`[\s\S]*`DEC-193`/);
assert.match(inventory, /AI Company multi-agent completion planning \| pass/);
assert.match(inventory, /`DEC-162`, `DEC-163`, `DEC-164`, `DEC-165`, `DEC-166`/);
assert.match(readme, /docs\/113_ai-company-multi-agent-completion-plan\.md/);
assert.match(
  readme,
  /docs\/114_ai-company-durable-staffing-plan-implementation-decision-handoff\.md/,
);
assert.match(readme, /`DEC-166` consumes that handoff and implements[\s\S]*schema-v16-to-v17/);
assert.match(readme, /`DEC-169` consumes[\s\S]*immutable schema-v18 StaffingEntry/);
assert.match(readme, /`DEC-170` records Stage 3 operator-stepped WorkOrder scheduler planning/);
assert.match(readme, /`DEC-173` records the Stage 4A bounded parallel read-only specialists plan/);
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

assert.match(contracts, /const STATE_SCHEMA_VERSION = 23/);
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
        staffingEntryImplementation: 'accepted-dec-169',
        operatorSteppedSchedulerPlanning: 'accepted-dec-170',
        operatorSteppedSchedulerHandoff: 'documented-dec-171',
        operatorSteppedSchedulerImplementation: 'accepted-dec-172',
        specialistBatchPreviewPlanning: 'accepted-dec-173',
        specialistBatchPreviewHandoff: 'documented-dec-174',
        specialistBatchPreviewClarification: 'accepted-dec-175',
        specialistBatchPreviewImplementation: 'accepted-dec-176',
        durableSpecialistBatchPlanning: 'accepted-dec-177',
        durableSpecialistBatchHandoff: 'documented-dec-178',
        durableSpecialistBatchImplementation: 'accepted-dec-179',
        specialistCellRetryPlanning: 'accepted-dec-180',
        specialistCellRetryHandoff: 'documented-dec-181',
        specialistCellRetryImplementation: 'accepted-dec-182',
        opsSupervisionPreviewPlanning: 'accepted-dec-183',
        opsSupervisionPreviewHandoff: 'documented-dec-184',
        opsSupervisionPreviewImplementation: 'accepted-dec-185',
        reviewerReworkPreviewPlanning: 'accepted-dec-186',
        reviewerReworkPreviewHandoff: 'documented-dec-187',
        reviewerReworkPreviewImplementation: 'accepted-dec-188',
        durableReviewerReworkPlanPlanning: 'accepted-dec-189',
        durableReviewerReworkPlanHandoff: 'documented-dec-190',
        durableReviewerReworkPlanImplementation: 'accepted-dec-191',
        reworkPlanAcceptancePlanning: 'accepted-dec-192',
        reworkPlanAcceptanceHandoff: 'documented-dec-193',
        reworkPlanAcceptanceImplementation: 'accepted-dec-194',
      },
      currentRuntime: {
        schemaVersion: 23,
        councilStaffingSnapshot: true,
        durableStaffingPlan: true,
        staffingEntryBoundCouncil: true,
        operatorSteppedScheduler: true,
        specialistBatchPreview: true,
        durableSpecialistBatch: true,
        reviewerReworkPreview: true,
        durableReviewerReworkPlan: true,
        reworkPlanAcceptance: true,
        fixedWorkOrderRoles: ['builder', 'reviewer', 'qa'],
        parallelSpecialistsEnabled: false,
        continuationMaxSteps: 1,
      },
      nextImplementationTarget: {
        stage: '5D',
        object: 'builder-rework-append-and-execution',
        implementationAllowed: false,
        nextDecisionLogEntry: 'complete-fielded-decision-required',
      },
      authority: {
        documentationAllowed: true,
        priorApprovedSlicesImplemented: true,
        schemaV20MigrationAllowed: true,
        specialistBatchRecordAllowed: true,
        councilBindingAllowed: true,
        operatorSteppedSchedulerPlanningAllowed: true,
        workOrderAttemptImplementationAllowed: true,
        operatorSteppedSchedulingAllowed: true,
        specialistBatchPreviewPlanningAllowed: true,
        specialistBatchPreviewImplementationAllowed: true,
        durableSpecialistBatchPlanningAllowed: true,
        durableSpecialistBatchImplementationAllowed: true,
        specialistCellRetryPlanningAllowed: true,
        specialistCellRetryImplementationAllowed: true,
        opsSupervisionPreviewPlanningAllowed: true,
        opsSupervisionPreviewImplementationAllowed: true,
        reviewerReworkPreviewPlanningAllowed: true,
        reviewerReworkPreviewImplementationAllowed: true,
        durableReviewerReworkPlanPlanningAllowed: true,
        durableReviewerReworkPlanImplementationAllowed: true,
        reworkPlanAcceptancePlanningAllowed: true,
        reworkPlanAcceptanceImplementationAllowed: true,
        activeSpecialistAttemptRecoveryAllowed: false,
        generalSchedulingAllowed: false,
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
