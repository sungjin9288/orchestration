import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-mission-task-close-out-planning-smoke';

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
  for (const pattern of patterns) assert.match(source, pattern);
}

const plan = read('docs/70_ai-company-mission-task-close-out-plan.md');
const handoff = read(
  'docs/71_ai-company-mission-task-close-out-implementation-decision-handoff.md',
);
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
const ui = read('ui/app.js');

const planText = compact(plan);
const handoffText = compact(handoff);
const readmeText = compact(readme);
const roadmapText = compact(roadmap);

assert.match(plan, /^# AI Company Mission And Task Close-Out Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Planned State Schema v11',
  'MissionCloseOut Contract',
  'Digest And Idempotency Binding',
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
  /operator-delegated-ai-company-mission-task-close-out-planning-001/,
  /approve-ai-company-mission-task-close-out-planning-only/,
  /planning only for one deterministic local schema-v11 atomic Mission and linked control-task close-out/,
  /schema-v10 accepted DeliveryPackage evidence/,
  /append one immutable MissionCloseOut record/,
  /task Review -> Done and Mission executing -> completed/,
  /save migration and the later record plus both lifecycle transitions atomically/,
  /runtime must check for an existing MissionCloseOut by Mission id/,
  /terminal replay branch is evaluated before the `executing`\/`Review` preconditions/,
  /guard those two generic methods/,
  /direct transition to `Done` and derived Mission `completed` are rejected unless a matching strict MissionCloseOut record already exists/,
  /single-process local server\/runtime/,
  /GET \/api\/missions\/:missionId\/close-out/,
  /POST \/api\/missions\/:missionId\/close-out/,
  /does not call `executionCoordinator\.runCloseOut`/,
  /Planning-only authority: accepted as `DEC-104`/,
  /Complete fielded implementation handoff: documented as `DEC-105`/,
  /implementation: accepted as `DEC-106` and verified on current schema v11/,
]);

assert.match(
  handoff,
  /^# AI Company Mission And Task Close-Out Implementation Decision Handoff$/m,
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
  /operator-decision-ai-company-mission-task-close-out-implementation-001/,
  /approve-ai-company-mission-task-close-out-implementation-slice/,
  /one deterministic local schema-v11 atomic Mission and linked control-task close-out/,
  /decision=close-out/,
  /terminal-record-first exact idempotent replay/,
  /generic lifecycle and Mission sync bypass rejection/,
  /standalone close-out commit push release learning scheduling providers policy or connectors/,
  /stillBlockedAuthorities=Mission or task reopen/,
  /`approval`.*`approved`.*`continue`.*`do everything`.*`approve all`.*`self approve`.*`use your judgment`/,
]);

assert.match(decisionLog, /^### DEC-104$/m);
assert.match(decisionLog, /^### DEC-105$/m);
assert.match(decisionLog, /^### DEC-106$/m);
assert.match(masterPlan, /Mission\/task close-out planning-only authority는 `DEC-104`/);
assert.match(runtimeContract, /Mission\/task close-out planning은 `DEC-104`/);
assert.match(councilProtocol, /Mission\/task close-out planning은 `DEC-104`/);
assertAll(roadmapText, [
  /Mission\/task close-out planning-only authority는 `DEC-104`/,
  /complete fielded implementation handoff는 `DEC-105`/,
  /exact schema-v11 implementation은 `DEC-106`/,
]);
assert.match(
  completionInventory,
  /AI Company Mission and task close-out planning \| pass/,
);
assertAll(readmeText, [
  /Mission\/task close-out planning-only authority is accepted by `DEC-104`/,
  /exact implementation is accepted by `DEC-106`/,
  /execution state is schema v13/,
]);
assert.match(taskLedger, /ai-company-mission-task-close-out-planning-post-m7-1956/);
assert.match(
  lessons,
  /AI Company Mission close-out must not reuse standalone commit and release close-out authority/,
);
assert.match(verification, /id: 'ai-company-mission-task-close-out-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-mission-task-close-out-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 13/);
assert.match(contracts, /missionCloseOut: 0/);
assert.match(contracts, /missionCloseOuts: \{\}/);
assert.match(fileStore, /validateMissionCloseOutRecords/);
assert.match(runtimeService, /function closeOutMissionAndTask\(/);
assert.match(runtimeService, /function getMissionCloseOut\(/);
assert.match(server, /missionCloseOutMatch/);
assert.match(ui, /data-action="close-out-ai-company-mission"/);
assert.match(runtimeService, /function acceptDeliveryPackage\(/);
assert.match(executionCoordinator, /async function runCloseOut\(/);
assert.match(server, /const closeOutRunMatch = url\.pathname\.match/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-104',
        handoff: 'documented-dec-105',
        implementation: 'accepted-dec-106',
      },
      plannedPath: {
        sourceSchemaVersion: 10,
        plannedSchemaVersion: 11,
        recordType: 'MissionCloseOut',
        decision: 'closed-out',
        atomicTransitions: ['task:Review->Done', 'mission:executing->completed'],
        standaloneCloseOutInvoked: false,
      },
      currentRuntime: {
        schemaVersion: 12,
        acceptanceRecords: true,
        missionCloseOutRecords: true,
        missionCloseOutRoutes: true,
        missionCloseOutUiAction: true,
        standaloneCloseOutPreserved: true,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        missionCloseOutAllowed: true,
        taskDoneAllowed: true,
        standaloneCloseOutAllowedByThisDecision: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
        releaseAllowed: false,
        learningAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
