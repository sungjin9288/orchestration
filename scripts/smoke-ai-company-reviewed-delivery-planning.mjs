import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-reviewed-delivery-planning-smoke';

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

const plan = read('docs/62_ai-company-reviewed-delivery-planning-plan.md');
const handoff = read('docs/63_ai-company-reviewed-delivery-implementation-decision-handoff.md');
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
const runtimeService = read('src/runtime/runtime-service.js');
const executionCoordinator = read('src/execution/execution-coordinator.js');
const server = read('scripts/serve-ui-slice-01.mjs');

const planText = compact(plan);
const handoffText = compact(handoff);
const roadmapText = compact(roadmap);
const readmeText = compact(readme);

assert.match(plan, /^# AI Company Reviewed Delivery Continuation Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Durable Status Transitions',
  'Constrained QA Contract',
  'QA Evidence Artifact',
  'Response-Only DeliveryPackage Preview',
  'Runtime And API Plan',
  'UI Boundary',
  'Compatibility',
  'Focused Verification Plan',
  'Rollback Plan',
  'Implementation Target Surface',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Planning Status',
]);

assertAll(planText, [
  /operator-delegated-ai-company-reviewed-delivery-planning-001/,
  /approve-ai-company-reviewed-delivery-planning-only/,
  /planning only for one explicit local-stub reviewed-delivery continuation/,
  /active plan \+ Builder waiting-gate -> exact terminal live-mutation approval approved/,
  /Accept only commands that parse exactly as `node --check <relative-path>`/,
  /Resolve `node` to `process\.execPath`; do not invoke a shell/,
  /Require the path to be repository-relative, non-symlinked outside the project/,
  /response-only DeliveryPackage preview/,
  /persisted = false/,
  /missionDone = false/,
  /POST \/api\/execution-plans\/:id\/continue-reviewed-delivery/,
  /GET \/api\/execution-plans\/:id\/delivery-preview/,
  /Runtime\/API\/UI\/source implementation: accepted as `DEC-094`/,
]);

assert.match(
  handoff,
  /^# AI Company Reviewed Delivery Implementation Decision Handoff$/m,
);
assertSections(handoff, [
  'Purpose',
  'Current Gate',
  'Minimum Required Decision Fields',
  'Recommended Approval Shape',
  'Other Valid Outcomes',
  'Invalid Shortcuts',
  'Minimum Acceptance Criteria',
  'Stop Conditions',
  'Verification After A Later Decision',
]);
assertAll(handoffText, [
  /operator-decision-ai-company-reviewed-delivery-implementation-001/,
  /approve-ai-company-reviewed-delivery-implementation-slice/,
  /one explicit local-stub pass-path from one schema-v7 ExecutionPlan Builder waiting-gate/,
  /shell-free allowlisted node --check QA/,
  /one response-only DeliveryPackage preview/,
  /stillBlockedAuthorities=durable DeliveryPackage persistence, Mission done/,
  /General approval, continuation wording, delegated non-critical self-approval/,
  /approval approved continue do everything approve all self approve use your judgment/,
]);

assert.match(decisionLog, /^### DEC-092$/m);
assert.match(decisionLog, /^### DEC-093$/m);
assert.match(decisionLog, /^### DEC-094$/m);
assert.match(
  decisionLog,
  /Accept `operator-delegated-ai-company-reviewed-delivery-planning-001`/,
);
assert.match(
  decisionLog,
  /Define the AI Company reviewed-delivery implementation decision handoff as read-only input/,
);
assert.match(decisionLog, /approve-ai-company-reviewed-delivery-implementation-slice/);
assert.match(masterPlan, /complete fielded implementation은 `DEC-094`/);
assert.match(runtimeContract, /exact implementation은 `DEC-094`/);
assert.match(councilProtocol, /exact implementation은 `DEC-094`/);
assertAll(roadmapText, [
  /Planning-only authority는 `DEC-092`/,
  /targetAuthority=one explicit local-stub pass-path from one schema-v7 ExecutionPlan Builder waiting-gate/,
  /Implemented Phase 6 preserves schema v7/,
]);
assert.match(completionInventory, /AI Company reviewed-delivery planning \| pass/);
assertAll(readmeText, [
  /Phase 6 reviewed-delivery continuation planning is accepted by `DEC-092`/,
  /exact fielded implementation is accepted by\s+`DEC-094`/,
  /shell-free `process\.execPath --check`/,
  /deeply frozen response-only DeliveryPackage preview/,
]);
assert.match(taskLedger, /ai-company-reviewed-delivery-implementation-post-m7-1949/);
assert.match(lessons, /A QA WorkOrder must not execute free-form verification commands through a shell/);
assert.match(verification, /id: 'ai-company-reviewed-delivery-planning'/);
assert.match(verification, /id: 'ai-company-reviewed-delivery-implementation'/);
assert.match(verification, /id: 'ai-company-reviewed-delivery-ui-api'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-reviewed-delivery-planning\.mjs'/,
);

// Pin both the reusable waiting-gate baseline and the consumed exact implementation surface.
assert.match(contracts, /const STATE_SCHEMA_VERSION = 7/);
assert.match(contracts, /WAITING_GATE: 'waiting-gate'/);
assert.match(contracts, /QA_EVIDENCE: 'qa-evidence'/);
assert.match(contracts, /DELIVERY_READY: 'delivery-ready'/);
assert.match(runtimeService, /function beginSequentialWorkOrderExecution\(input\)/);
assert.match(runtimeService, /function finalizeSequentialWorkOrderExecution\(input\)/);
assert.match(runtimeService, /function beginReviewedDeliveryContinuation\(input\)/);
assert.match(runtimeService, /function previewExecutionPlanDelivery\(input\)/);
assert.match(executionCoordinator, /async function runBuilderLiveMutation\(input\)/);
assert.match(executionCoordinator, /async function runReviewer\(input\)/);
assert.match(executionCoordinator, /async function runQaWorkOrder\(input\)/);
assert.match(server, /continue-reviewed-delivery/);
assert.match(server, /delivery-preview/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-092',
        handoff: 'documented-dec-093',
        implementation: 'accepted-dec-094',
      },
      plannedPath: {
        providerMode: 'local-stub-only',
        start: 'exact-approved-builder-live-mutation-gate',
        sequence: ['builder-live-mutation', 'reviewer', 'constrained-node-check-qa'],
        output: 'response-only-delivery-package-preview',
        missionDone: false,
      },
      currentRuntime: {
        schemaVersion: 7,
        builderWaitingGateImplemented: true,
        reviewedDeliveryContinuation: true,
        qaRunner: true,
        deliveryPackageComposer: 'response-only',
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        sourceMutationAllowedThroughExactBuilderGate: true,
        reviewerQaExecutionAllowedThroughNamedPath: true,
        arbitraryCommandExecutionAllowed: false,
        durableDeliveryPackageAllowed: false,
        missionDoneAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
        releaseAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
