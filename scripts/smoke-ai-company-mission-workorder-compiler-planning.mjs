import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-mission-workorder-compiler-planning-smoke';

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

const plan = read('docs/58_ai-company-mission-workorder-compiler-implementation-plan.md');
const handoff = read('docs/59_ai-company-mission-workorder-compiler-implementation-decision-handoff.md');
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
const blueprint = read('company/blueprint.json');
const councilSessions = read('src/runtime/council-sessions.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');

const planText = compact(plan);
const handoffText = compact(handoff);
const roadmapText = compact(roadmap);
const readmeText = compact(readme);

assert.match(plan, /^# AI Company Mission Compiler And Inert WorkOrder Implementation Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Implementation Objective',
  'Approved Future Target Surface',
  'Compile Input Contract',
  'Deterministic Output Contract',
  'Fixed WorkOrder Graph',
  'Dependency And Collision Validation',
  'Runtime And API Compatibility Plan',
  'Persistence And Schema Compatibility',
  'UI Boundary',
  'Focused Verification Plan',
  'Rollback Plan',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Planning Status',
  'Verification',
]);

assertAll(planText, [
  /operator-delegated-ai-company-mission-workorder-compiler-planning-001/,
  /approve-ai-company-mission-workorder-compiler-planning-only/,
  /planning only for one deterministic Mission-to-ExecutionPlan and inert WorkOrder draft compiler/,
  /no ExecutionPlan, WorkOrder, HandoffPacket, compile request, graph validator, inert preview route/,
  /Council synthesis does not contain target path allowlists or verification commands/,
  /handoffMode=inert-workorder-preview/,
  /exact operator `compileSpec`/,
  /builder-preflight -> reviewer -> qa/,
  /dependencyCycleFree/,
  /mutableTargetCollisionFree/,
  /persistenceAllowed: false/,
  /executionAllowed: false/,
  /approvalAllowed: false/,
  /Persisted state remains `schemaVersion: 6`/,
  /`createEmptyState` and file-store normalization are not edited/,
  /never calls `saveState`/,
  /Requests without `handoffMode=inert-workorder-preview` retain the current linked-task auto-chain/,
  /No `run`, `approve WorkOrders`, `persist`, `mutate`, `commit`, `push`, or `release` control is added/,
  /Runtime\/API\/UI implementation: complete for the exact response-only target surface/,
  /Downstream persistence, approval, scheduling, and execution authority: still blocked/,
]);

assert.match(
  handoff,
  /^# AI Company Mission Compiler And Inert WorkOrder Implementation Decision Handoff$/m,
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
  /operator-decision-ai-company-mission-workorder-compiler-implementation-001/,
  /approve-ai-company-mission-workorder-compiler-implementation-slice/,
  /one deterministic in-memory Mission-to-ExecutionPlan and inert Builder Reviewer QA WorkOrder preview path/,
  /implementationPlanRefs=docs\/58_ai-company-mission-workorder-compiler-implementation-plan\.md/,
  /compatibilityPlanRefs=keep schemaVersion 6/,
  /create no persisted plan WorkOrder task run artifact approval or checkpoint/,
  /stillBlockedAuthorities=ExecutionPlan or WorkOrder persistence/,
  /This does not approve durable plan or WorkOrder records/,
  /self-approve implementation/,
]);

assert.match(decisionLog, /^### DEC-086$/m);
assert.match(decisionLog, /^### DEC-087$/m);
assert.match(decisionLog, /^### DEC-088$/m);
assert.match(decisionLog, /Accept `operator-delegated-ai-company-mission-workorder-compiler-planning-001`/);
assert.match(decisionLog, /records no implementation outcome and creates no ExecutionPlan/);
assert.match(masterPlan, /exact implementation은 `DEC-088`로/);
assert.match(runtimeContract, /exact operator\s+`compileSpec`/);
assert.match(councilProtocol, /Existing linked-task\s+auto-chain은 explicit mode가 없을 때 compatibility behavior/);
assertAll(roadmapText, [
  /Planning-only authority는 `DEC-086`, implementation decision handoff는 `DEC-087`, exact response-only implementation은 `DEC-088`/,
  /targetAuthority=planning only for durable WorkOrder persistence, approval, and sequential execution through existing gates/,
  /implemented Phase 1-5 evidence, schema v7 migration, durable\s+approval binding, Builder live-mutation stop gate/,
]);
assert.match(completionInventory, /AI Company Mission compiler and inert WorkOrder planning \| pass/);
assert.match(completionInventory, /AI Company Mission compiler and inert WorkOrder implementation \| pass/);
assertAll(readmeText, [
  /exact response-only implementation is accepted by `DEC-088`/,
  /fixed Builder -> Reviewer -> QA draft graph/,
  /The preview itself remains response-only; durable promotion is available only through the explicit\s+Phase 5 path/,
  /Reviewer\/QA execution, source mutation, broader scheduling, provider-backed\s+WorkOrders, commit, push, release, and connectors remain blocked/,
]);
assert.match(taskLedger, /ai-company-mission-workorder-compiler-planning-post-m7-1944/);
assert.match(lessons, /A deterministic WorkOrder compiler must not invent execution-critical fields/);
assert.match(verification, /id: 'ai-company-mission-workorder-compiler-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-mission-workorder-compiler-planning\.mjs'/,
);

// The accepted implementation consumes this plan without widening downstream authority.
assert.match(runtimeService, /mission-workorder-compiler/);
assert.match(server, /inert-workorder-preview/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/runtime/mission-workorder-compiler.js')),
  true,
);
assert.match(councilSessions, /SYNTHESIS_OUTPUT_KEYS/);
assert.doesNotMatch(councilSessions, /targetPathAllowlist/);
assert.match(blueprint, /"role": "builder"/);
assert.match(blueprint, /"role": "reviewer"/);
assert.match(blueprint, /"role": "qa"/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-086',
        handoff: 'documented-dec-087',
        implementation: 'accepted-dec-088',
      },
      plannedPath: {
        handoffMode: 'inert-workorder-preview',
        input: 'source-current-council-plus-exact-operator-compile-spec-preflight-before-approval',
        graph: ['builder-preflight', 'reviewer', 'qa'],
        output: 'deterministic-response-only-preview',
        persistence: false,
        execution: false,
      },
      compatibility: {
        schemaVersion: 7,
        fileStoreMigrationPlanned: false,
        defaultLinkedTaskAutoChainPreserved: true,
        providerCallsDuringCompile: false,
      },
      phase4Authority: {
        planningAllowed: true,
        compilerImplementationAllowed: true,
        workOrderPersistenceAllowed: false,
        workOrderExecutionAllowed: false,
        staffingPlanRuntimeAllowed: false,
        schedulingAllowed: false,
        sourceMutationAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
      },
      currentPhase5Boundary: {
        durableWorkOrderRecordsAllowed: true,
        sequentialBuilderPreflightAllowed: true,
        builderLiveMutationAllowed: false,
        reviewerOrQaExecutionAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
