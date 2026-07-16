import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-workorder-persistence-execution-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function compact(source) {
  return source.replace(/\s+/g, ' ').trim();
}

function assertSections(source, sections) {
  for (const section of sections) {
    assert.match(source, new RegExp(`^## ${section}$`, 'm'));
  }
}

function assertAll(source, patterns) {
  for (const pattern of patterns) {
    assert.match(source, pattern);
  }
}

const plan = read('docs/60_ai-company-workorder-persistence-execution-plan.md');
const handoff = read('docs/61_ai-company-workorder-persistence-execution-decision-handoff.md');
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const roadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionInventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const fileStore = read('src/runtime/file-store.js');
const runtimeService = read('src/runtime/runtime-service.js');
const executionCoordinator = read('src/execution/execution-coordinator.js');
const server = read('scripts/serve-ui-slice-01.mjs');

const planText = compact(plan);
const handoffText = compact(handoff);
const roadmapText = compact(roadmap);
const readmeText = compact(readme);

assert.match(
  plan,
  /^# AI Company WorkOrder Persistence And Sequential Execution Plan$/m,
);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Planned State Schema v7',
  'Record Contracts',
  'Approval Contract',
  'Sequential Builder Dispatch',
  'Runtime And API Plan',
  'UI Boundary',
  'Compatibility And Migration',
  'Focused Verification Plan',
  'Rollback Plan',
  'Implementation Target Surface',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Planning Status',
  'Verification',
]);

assertAll(planText, [
  /operator-delegated-ai-company-workorder-persistence-execution-planning-001/,
  /approve-ai-company-workorder-persistence-execution-planning-only/,
  /planning only for one durable ExecutionPlan and WorkOrder record set, one digest-bound operator approval, and one sequential Builder dispatch/,
  /persisted state is schema v6 with no ExecutionPlan, WorkOrder, or HandoffPacket maps or sequences/,
  /schema v6 to schema v7/,
  /sequences\.executionPlan/,
  /executionPlans\{\}/,
  /scope=execution-plan/,
  /allowedNextAction=start-workorder-sequential-execution/,
  /planner -> architect -> task-breaker -> builder-preflight -> live-mutation approval/,
  /local-stub-only/,
  /Reviewer and QA WorkOrders remain `blocked-dependency`/,
  /POST \/api\/council-sessions\/:id\/work-order-plans/,
  /POST \/api\/execution-plans\/:id\/start-sequential/,
  /Do not downgrade or delete state to simulate rollback/,
  /Runtime\/API\/UI\/schema implementation: accepted and implemented as `DEC-091`/,
]);

assert.match(
  handoff,
  /^# AI Company WorkOrder Persistence And Sequential Execution Decision Handoff$/m,
);
assertSections(handoff, [
  'Purpose',
  'Current Gate',
  'Source Evidence',
  'Valid Implementation Decision Shape',
  'Rejection Decision Shape',
  'Invalid Shortcuts',
  'Minimum Acceptance Criteria',
  'Still Blocked After Approval',
  'Stop Conditions',
  'Verification',
]);

assertAll(handoffText, [
  /operator-decision-ai-company-workorder-persistence-execution-implementation-001/,
  /approve-ai-company-workorder-persistence-execution-implementation-slice/,
  /one local deterministic schema-v7 durable ExecutionPlan and WorkOrder record path/,
  /implementationPlanRefs=docs\/60_ai-company-workorder-persistence-execution-plan\.md/,
  /migrationPlanRefs=add schemaVersion 7/,
  /reject non-local provider mode for the new sequential dispatch/,
  /stop at the existing builder live-mutation approval/,
  /stillBlockedAuthorities=builder live mutation, Reviewer or QA WorkOrder execution/,
  /This permits no source mutation/,
  /self-approve implementation/,
]);

assert.match(decisionLog, /^### DEC-089$/m);
assert.match(decisionLog, /^### DEC-090$/m);
assert.match(decisionLog, /^### DEC-091$/m);
assert.match(
  decisionLog,
  /Accept `operator-delegated-ai-company-workorder-persistence-execution-planning-001`/,
);
assert.match(decisionLog, /Accept `operator-decision-ai-company-workorder-persistence-execution-implementation-001`/);
assert.match(masterPlan, /implementation은 `DEC-091`로 accepted됐다/);
assert.match(runtimeContract, /schema v7 durable record planning은 `DEC-089`/);
assert.match(councilProtocol, /implementation은 `DEC-091`로 accepted됐다/);
assertAll(roadmapText, [
  /implementation은 `DEC-091`로 기록됐다/,
  /targetAuthority=one local deterministic schema-v7 durable ExecutionPlan and WorkOrder record path/,
  /첫 implementation target은 general scheduler가 아니라 additive schema v7 records/,
]);
assert.match(
  completionInventory,
  /AI Company WorkOrder persistence and sequential execution planning \| pass/,
);
assert.match(
  completionInventory,
  /AI Company WorkOrder persistence and sequential execution implementation \| pass/,
);
assertAll(readmeText, [
  /Phase 5 WorkOrder persistence and sequential execution planning is accepted by `DEC-089`/,
  /exact fielded implementation is accepted by `DEC-091`/,
  /Valid v6 state now migrates additively to schema v7/,
]);
assert.match(taskLedger, /ai-company-workorder-persistence-execution-planning-post-m7-1946/);
assert.match(taskLedger, /ai-company-workorder-persistence-execution-implementation-post-m7-1947/);
assert.match(lessons, /A durable WorkOrder slice should reuse the narrowest existing execution gate/);
assert.match(verification, /id: 'ai-company-workorder-persistence-execution-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-workorder-persistence-execution-planning\.mjs'/,
);

// Consumed planning must remain truthful about the current schema-v7 implementation boundary.
assert.match(contracts, /const STATE_SCHEMA_VERSION = 10/);
assert.match(contracts, /executionPlans: \{\}/);
assert.match(contracts, /workOrders: \{\}/);
assert.match(fileStore, /executionPlans: state\.executionPlans \|\| \{\}/);
assert.match(runtimeService, /function persistMissionWorkOrderPlan\(input\)/);
assert.match(runtimeService, /function beginSequentialWorkOrderExecution\(input\)/);
assert.doesNotMatch(executionCoordinator, /startWorkOrderSequentialExecution/);
assert.match(server, /work-order-plans/);
assert.match(server, /start-sequential/);
assert.match(server, /inert-workorder-preview/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-089',
        handoff: 'documented-dec-090',
        implementation: 'accepted-dec-091',
      },
      plannedPath: {
        schemaVersion: 8,
        records: ['executionPlan', 'workOrder', 'handoffPacket'],
        approval: 'digest-bound-task-owned',
        dispatch: 'local-sequential-builder-only',
        stop: 'existing-builder-live-mutation-approval',
      },
      currentBaseline: {
        schemaVersion: 8,
        preview: 'response-only-compatible',
        durableWorkOrderRecords: true,
        workOrderExecution: 'builder-preflight-only',
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: true,
        durableRecordsAllowed: true,
        sourceMutationAllowed: false,
        reviewerQaExecutionAllowed: false,
        parallelSchedulingAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
