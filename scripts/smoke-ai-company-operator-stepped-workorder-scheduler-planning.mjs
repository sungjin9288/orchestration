import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-operator-stepped-workorder-scheduler-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const plan = read('docs/117_ai-company-operator-stepped-workorder-scheduler-plan.md');
const handoff = read(
  'docs/118_ai-company-operator-stepped-workorder-scheduler-implementation-decision-handoff.md',
);
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
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
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');

assert.match(plan, /^# AI Company Operator-Stepped WorkOrder Scheduler Plan$/m);
assert.match(
  plan,
  /operator-delegated-ai-company-operator-stepped-workorder-scheduler-planning-001/,
);
assert.match(
  plan,
  /approve-ai-company-operator-stepped-workorder-scheduler-planning-only/,
);
assert.match(plan, /schema v18 with immutable accepted StaffingPlan and StaffingEntry records/);
assert.match(plan, /reject every session carrying\s+`staffingEntryRef`/);
assert.match(plan, /schema v19 adds only:/i);
assert.match(plan, /sequences\.workOrderAttempt: number/);
assert.match(plan, /workOrderAttempts: Record<string, WorkOrderAttempt>/);
assert.match(plan, /saved before the execution coordinator is called/);
assert.match(plan, /sort ready candidates by numeric `position`, then stable WorkOrder id/);
assert.match(plan, /Only one active attempt is allowed per ExecutionPlan/);
assert.match(plan, /Start does not execute live mutation, Reviewer, or QA/);
assert.match(plan, /Each successful step returns after one role/);
assert.match(plan, /POST \/api\/execution-plans\/:executionPlanId\/step/);
assert.match(plan, /GET  \/api\/work-order-attempts\/:workOrderAttemptId/);
assert.match(plan, /There is no timer, polling worker, recursive continuation/);
assert.match(plan, /Planning-only authority is recorded as `DEC-170`/);
assert.match(
  plan,
  /complete fielded implementation decision\s+handoff is recorded as `DEC-171`/,
);

assert.match(
  handoff,
  /^# AI Company Operator-Stepped WorkOrder Scheduler Implementation Decision Handoff$/m,
);
assert.match(
  handoff,
  /operator-decision-ai-company-operator-stepped-workorder-scheduler-implementation-001/,
);
assert.match(
  handoff,
  /approve-ai-company-operator-stepped-workorder-scheduler-implementation-slice/,
);
assert.match(handoff, /src\/runtime\/work-order-attempts\.js/);
assert.match(handoff, /scripts\/smoke-ui-slice-698\.mjs/);
assert.match(handoff, /schemaVersion 19 sequences\.workOrderAttempt and workOrderAttempts map only/);
assert.match(handoff, /current schema 18 becomes 19 or future schema 19 becomes 20/);
assert.match(handoff, /save one active attempt before coordinator execution/);
assert.match(handoff, /execute exactly one local role boundary per explicit start or step/);
assert.match(handoff, /delegated self-approval for schema migration/);
assert.match(handoff, /retain valid v19 evidence during rollback without downgrade/);
assert.match(
  handoff,
  /scripts\/smoke-ai-company-operator-stepped-workorder-scheduler-planning\.mjs/,
);

for (const decisionId of ['DEC-169', 'DEC-170', 'DEC-171', 'DEC-172']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-170[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, schema, API, UI, provider, source, Git, scheduler, policy, bypass, or connector behavior/,
);
assert.match(
  decisionLog,
  /### DEC-171[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*does not authorize schema, runtime, API, UI, durable attempt, WorkOrder, or dispatch mutation/,
);
assert.match(
  decisionLog,
  /### DEC-172[\s\S]*Status: `Accepted`[\s\S]*schema-v19 operator-stepped WorkOrder scheduler[\s\S]*one local role boundary per explicit start or step/,
);

assert.match(masterPlan, /`DEC-172` implements the Stage 3 operator-stepped WorkOrder scheduler/);
assert.match(runtimeContract, /bounded implementation은 `DEC-172`/);
assert.match(councilProtocol, /implementation은 `DEC-172`/);
assert.match(deliveryRoadmap, /`DEC-172` implements the bounded schema-v19 path/);
assert.match(inventory, /AI Company operator-stepped WorkOrder scheduler implementation \| pass/);
assert.match(readme, /docs\/117_ai-company-operator-stepped-workorder-scheduler-plan\.md/);
assert.match(
  readme,
  /docs\/118_ai-company-operator-stepped-workorder-scheduler-implementation-decision-handoff\.md/,
);
assert.match(taskLedger, /ai-company-operator-stepped-workorder-scheduler-planning-post-m7-2011/);
assert.match(
  lessons,
  /A durable operator-stepped scheduler must record an active attempt before coordinator execution/,
);
assert.match(verification, /id: 'ai-company-operator-stepped-workorder-scheduler-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-operator-stepped-workorder-scheduler-planning\.mjs'/,
);

assert.match(completionPlan, /### Stage 3: Operator-Stepped WorkOrder Scheduler/);
assert.match(contracts, /const STATE_SCHEMA_VERSION = 19/);
assert.match(contracts, /workOrderAttempt: 0/);
assert.match(contracts, /workOrderAttempts: \{\}/);
assert.match(runtimeService, /function assertBoundStaffingSchedulerSourceCurrent/);
assert.match(runtimeService, /function beginSequentialWorkOrderExecution\(input\)/);
assert.match(runtimeService, /function beginOperatorSteppedWorkOrderStep\(input\)/);
assert.match(runtimeService, /selectOperatorSteppedWorkOrder/);
assert.match(server, /continue-reviewed-delivery/);
assert.match(server, /const executionPlanOperatorStepMatch = url\.pathname\.match/);
assert.match(server, /runtime\.beginOperatorSteppedWorkOrderStep/);
assert.match(server, /runtime\.getWorkOrderAttempt/);
assert.equal(fs.existsSync(path.join(repoRoot, 'src/runtime/work-order-attempts.js')), true);
assert.equal(
  fs.existsSync(
    path.join(repoRoot, 'scripts/smoke-ai-company-operator-stepped-workorder-scheduler.mjs'),
  ),
  true,
);
assert.equal(fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-698.mjs')), true);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      decisions: {
        implementation: 'accepted-dec-172',
        planning: 'accepted-dec-170',
        handoff: 'documented-dec-171',
      },
      currentRuntime: {
        schemaVersion: 19,
        staffingEntryBoundCouncil: true,
        boundWorkOrderCompilation: true,
        workOrderAttempt: true,
        operatorStep: true,
      },
      plannedSlice: {
        schemaVersion: 19,
        object: 'WorkOrderAttempt',
        providerMode: 'local-stub',
        selection: 'dependency-ready-position-then-id',
        oneRolePerCommand: true,
        activeBeforeExecution: true,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: true,
        durableAttemptAllowed: true,
        boundWorkOrderAllowed: true,
        operatorStartAllowed: true,
        operatorStepAllowed: true,
        parallelAllowed: false,
        retryOrReworkAllowed: false,
        providerWorkOrderAllowed: false,
        backgroundSchedulingAllowed: false,
        sourceMutationExpansionAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
      },
      nextRequiredDecision:
        'operator-decision-ai-company-bounded-parallel-read-only-specialists-planning-001',
    },
    null,
    2,
  )}\n`,
);
