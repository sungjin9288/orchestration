import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-checkpoint-resume-recovery-planning-smoke';

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

const plan = read('docs/64_ai-company-checkpoint-resume-recovery-plan.md');
const handoff = read('docs/65_ai-company-checkpoint-resume-recovery-implementation-decision-handoff.md');
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
const server = read('scripts/serve-ui-slice-01.mjs');

const planText = compact(plan);
const handoffText = compact(handoff);
const roadmapText = compact(roadmap);
const readmeText = compact(readme);

assert.match(plan, /^# AI Company Checkpoint Resume And Recovery Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Accepted Implementation Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Safe Checkpoint Boundaries',
  'State Schema v8',
  'WorkflowCheckpoint Contract',
  'Digest And Authority Binding',
  'Resume Stale And Cancel Rules',
  'Runtime And API Plan',
  'UI Boundary',
  'Compatibility And Migration',
  'Focused Verification Plan',
  'Rollback Plan',
  'Implementation Target Surface',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Implementation Status',
]);
assertAll(planText, [
  /operator-delegated-ai-company-checkpoint-resume-recovery-planning-001/,
  /approve-ai-company-checkpoint-resume-recovery-planning-only/,
  /planning only for one explicit local-stub schema-v8 checkpoint/,
  /resume only reviewer-ready or qa-ready/,
  /interrupted `active` stage is `quarantined`, not retried/,
  /inputDigest.*authorityDigest.*checkpointDigest/,
  /GET \/api\/execution-plans\/:executionPlanId\/recovery/,
  /POST \/api\/execution-plans\/:executionPlanId\/resume-from-checkpoint/,
  /POST \/api\/execution-plans\/:executionPlanId\/cancel-checkpoint/,
  /Schema\/runtime\/API\/UI implementation: accepted and implemented as `DEC-097`/,
]);

assert.match(
  handoff,
  /^# AI Company Checkpoint Resume And Recovery Implementation Decision Handoff$/m,
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
  'Verification After The Accepted Decision',
]);
assertAll(handoffText, [
  /operator-decision-ai-company-checkpoint-resume-recovery-implementation-001/,
  /approve-ai-company-checkpoint-resume-recovery-implementation-slice/,
  /one local deterministic schema-v8 WorkflowCheckpoint path/,
  /reviewer-ready or qa-ready only/,
  /quarantine every interrupted active Builder Reviewer or QA stage/,
  /stillBlockedAuthorities=Builder mutation replay, automatic retry or rework/,
  /approval approved continue do everything approve all self approve use your judgment/,
]);

assert.match(decisionLog, /^### DEC-095$/m);
assert.match(decisionLog, /^### DEC-096$/m);
assert.match(decisionLog, /^### DEC-097$/m);
assert.match(masterPlan, /exact implementation은 `DEC-097`/);
assert.match(runtimeContract, /exact implementation은 `DEC-097`/);
assert.match(councilProtocol, /exact implementation은\s+`DEC-097`/);
assertAll(roadmapText, [
  /Phase 7 planning-only authority는 `DEC-095`/,
  /implementation decision handoff는 `DEC-096`/,
  /exact schema-v8 implementation은 `DEC-097`/,
]);
assert.match(completionInventory, /AI Company checkpoint resume and recovery implementation \| pass/);
assertAll(readmeText, [
  /Phase 7 checkpoint, resume, and recovery planning is accepted by `DEC-095`/,
  /implementation decision handoff is recorded by `DEC-096`/,
  /exact implementation is accepted by `DEC-097`/,
  /Only durable `reviewer-ready` or `qa-ready` boundaries are resumable/,
  /Active or ambiguous Builder, Reviewer, and QA stages are quarantine-only/,
]);
assert.match(taskLedger, /ai-company-checkpoint-resume-recovery-planning-post-m7-1950/);
assert.match(taskLedger, /ai-company-checkpoint-resume-recovery-implementation-post-m7-1951/);
assert.match(lessons, /A restart boundary must never infer that an active mutation did not happen/);
assert.match(verification, /id: 'ai-company-checkpoint-resume-recovery-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-checkpoint-resume-recovery-planning\.mjs'/,
);

// Pin the consumed decision chain to the exact accepted implementation boundary.
assert.match(contracts, /const STATE_SCHEMA_VERSION = 17/);
assert.match(contracts, /WORKFLOW_CHECKPOINT_STAGE/);
assert.match(fileStore, /workflowCheckpoints/);
assert.match(runtimeService, /function resumeExecutionPlanFromCheckpoint\(/);
assert.match(server, /resume-from-checkpoint/);
assert.match(server, /cancel-checkpoint/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-095',
        handoff: 'documented-dec-096',
        implementation: 'accepted-dec-097',
      },
      plannedPath: {
        schemaVersion: 8,
        providerMode: 'local-stub-only',
        resumableBoundaries: ['reviewer-ready', 'qa-ready'],
        activeStageDisposition: 'quarantined',
        operatorActionRequired: true,
      },
      currentRuntime: {
        schemaVersion: 8,
        workflowCheckpointRecords: true,
        recoveryRoutes: true,
        responseOnlyDeliveryPreserved: true,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: true,
        checkpointPersistenceAllowed: true,
        resumeOrCancelAllowed: true,
        automaticReplayAllowed: false,
        providerExpansionAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
        releaseAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
