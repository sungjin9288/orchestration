import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-real-council-planning-smoke';

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

const plan = read('docs/54_ai-company-real-council-implementation-plan.md');
const handoff = read('docs/55_ai-company-real-council-implementation-decision-handoff.md');
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
const runtimeContracts = read('src/runtime/contracts.js');
const fileStore = read('src/runtime/file-store.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const localStubAdapter = read('src/execution/providers/local-stub-adapter.js');
const councilLocalStubAdapter = read('src/execution/providers/council-local-stub-adapter.js');
const councilCoordinator = read('src/execution/council-coordinator.js');
const councilSessions = read('src/runtime/council-sessions.js');
const councilSignals = read('ui/council-signals.js');

const planText = compact(plan);
const handoffText = compact(handoff);
const roadmapText = compact(roadmap);
const readmeText = compact(readme);

assert.match(plan, /^# AI Company Real Council For One Mission Implementation Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Implementation Objective',
  'Exact Target Surface',
  'Runtime Domain Contract',
  'Independent Role Execution Contract',
  'Conflict And Synthesis Contract',
  'Alignment And Handoff Contract',
  'API Compatibility Plan',
  'UI Contract',
  'Persistence And Compatibility Plan',
  'Failure And Recovery',
  'Focused Smoke Plan',
  'Rollback Plan',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Implementation Decision Required',
  'Implementation Status',
  'Verification',
]);

assertAll(planText, [
  /operator-delegated-ai-company-real-council-planning-001/,
  /approve-ai-company-real-council-planning-only/,
  /Real Council for one Mission implementation planning using local-stub roles only/,
  /이 문서는 runtime implementation 승인이 아니다/,
  /src\/runtime\/council-sessions\.js/,
  /src\/execution\/council-coordinator\.js/,
  /src\/execution\/providers\/council-local-stub-adapter\.js/,
  /scripts\/smoke-ai-company-real-council\.mjs/,
  /scripts\/smoke-ui-slice-651\.mjs/,
  /same frozen agenda and source digest/,
  /A position request cannot contain another role's output/,
  /Required role failure or invalid output makes `approvalReady=false`/,
  /`approve`, `request-revision`, or `stop`/,
  /Persisted state remains `schemaVersion: 6`/,
  /`createEmptyState` and file-store normalization are not edited/,
  /Legacy routes remain byte- and behavior-compatible/,
  /No failure path falls back to a successful deterministic transcript/,
]);

assert.match(handoff, /^# AI Company Real Council Implementation Decision Handoff$/m);
assertSections(handoff, [
  'Purpose',
  'Current Gate',
  'Accepted Outcome',
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
  /operator-decision-ai-company-real-council-implementation-001/,
  /approve-ai-company-real-council-local-stub-implementation-slice/,
  /one Mission independent local-stub Council positions, deterministic conflict check, Conductor synthesis, and human alignment decisions/,
  /implementationPlanRefs=docs\/54_ai-company-real-council-implementation-plan\.md/,
  /compatibilityPlanRefs=keep schemaVersion 6/,
  /stillBlockedAuthorities=provider-assisted Council, standalone StaffingPlan runtime/,
  /This approval permits separate Strategist Architect and Decomposer position evidence/,
  /It does not approve live providers, standalone StaffingPlan, autonomous scheduling, WorkOrders/,
  /self-approve implementation/,
]);

assert.match(decisionLog, /^### DEC-080$/m);
assert.match(decisionLog, /^### DEC-081$/m);
assert.match(decisionLog, /^### DEC-082$/m);
assert.match(decisionLog, /Accept `operator-delegated-ai-company-real-council-planning-001`/);
assert.match(decisionLog, /records no runtime implementation outcome/);
assert.match(masterPlan, /^## Approved Real Council Planning Authority$/m);
assert.match(masterPlan, /^## Approved Real Council Implementation Authority$/m);
assert.match(runtimeContract, /Phase 2 planning evidence는 `DEC-082`가 consume했다/);
assert.match(councilProtocol, /complete fielded implementation outcome은 `DEC-082`로 기록됐다/);
assertAll(roadmapText, [
  /complete fielded implementation outcome은 `DEC-082`로 기록됐다/,
  /targetAuthority=Council live-provider opt-in implementation planning/,
]);
assert.match(completionInventory, /AI Company Real Council planning \| pass/);
assertAll(readmeText, [
  /Phase 2 Real Council implementation is accepted by `DEC-082`/,
  /opt-in `real-local-stub` path/,
  /Live providers, standalone StaffingPlan, WorkOrders, memory persistence expansion/,
]);
assert.match(taskLedger, /ai-company-real-council-planning-post-m7-1940/);
assert.match(taskLedger, /ai-company-real-council-implementation-post-m7-1941/);
assert.match(lessons, /A deterministic multi-role transcript is not independent-agent evidence/);
assert.match(verification, /id: 'ai-company-real-council-planning'/);
assert.match(verification, /script: 'scripts\/smoke-ai-company-real-council-planning\.mjs'/);

// The planning allowlist is now consumed implementation provenance.
for (const relativePath of [
  'src/runtime/council-sessions.js',
  'src/execution/council-coordinator.js',
  'src/execution/providers/council-local-stub-adapter.js',
  'scripts/smoke-ai-company-real-council.mjs',
  'scripts/smoke-ui-slice-651.mjs',
]) {
  assert.equal(fs.existsSync(path.join(repoRoot, relativePath)), true);
}

assert.match(blueprint, /"maxProviderCalls": 0/);
assert.match(runtimeContracts, /schemaVersion: 6/);
assert.match(fileStore, /councilSession\.transcript = Array\.isArray/);
assert.match(fileStore, /status: councilSession\.alignment\.status \|\| 'pending'/);
assert.match(runtimeService, /function buildCouncilSessionRecord\(state, mission, project, now\)/);
assert.match(runtimeService, /status: 'pending-alignment'/);
assert.match(runtimeService, /action: 'approve-recommendation'/);
assert.match(runtimeService, /function startRealCouncilForMission\(input\)/);
assert.match(runtimeService, /function resumeRealCouncilSession\(input\)/);
assert.match(runtimeService, /function decideRealCouncilSession\(input\)/);
assert.equal(server.includes('/draft-council$/);'), true);
assert.equal(server.includes('/approve-council$/,'), true);
assert.match(server, /council\\\/start/);
assert.match(server, /council-sessions\\\//);
assert.doesNotMatch(localStubAdapter, /council-local-stub|council-position|council-synthesis/);
assert.match(councilLocalStubAdapter, /createCouncilLocalStubAdapter/);
assert.match(councilCoordinator, /executePosition/);
assert.match(councilCoordinator, /executeSynthesis/);
assert.match(councilSessions, /REAL_COUNCIL_MODE = 'real-local-stub'/);
assert.match(councilSignals, /transcriptEntry/);
assert.match(councilSignals, /getCurrentRealCouncilAttempt/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted',
        implementation: 'accepted-and-implemented',
        nextGate: 'Council live-provider opt-in planning decision required',
      },
      plannedPath: {
        requiredPositionRoles: ['strategist', 'architect', 'decomposer'],
        synthesisRole: 'conductor',
        providerMode: 'local-stub-only',
        alignmentActions: ['approve', 'request-revision', 'stop'],
      },
      compatibility: {
        schemaVersion: 6,
        legacyRoutesPreserved: true,
        legacyCouncilPreserved: true,
        fileStoreMigrationPlanned: false,
      },
      currentRuntime: {
        realCouncilImplementationExists: true,
        council: 'opt-in-real-local-stub-with-legacy-deterministic-compatibility',
      },
      authority: {
        realCouncilImplementationAllowed: true,
        providerCallsAllowed: false,
        staffingPlanRuntimeAllowed: false,
        workOrderRuntimeAllowed: false,
        memoryPersistenceAllowed: false,
        autonomousSchedulingAllowed: false,
        sourceMutationAllowed: false,
        approvalBypassAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
