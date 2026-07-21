import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-durable-memory-item-planning-smoke';

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

const plan = read('docs/80_ai-company-durable-memory-item-persistence-plan.md');
const handoff = read(
  'docs/81_ai-company-durable-memory-item-implementation-decision-handoff.md',
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
const server = read('scripts/serve-ui-slice-01.mjs');
const ui = read('ui/app.js');

const planText = compact(plan);
const handoffText = compact(handoff);
const readmeText = compact(readme);
const roadmapText = compact(roadmap);

assert.match(plan, /^# AI Company Durable MemoryItem Persistence Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Planned State Schema v14',
  'Durable MemoryItem Contract',
  'Storage Approval And Digest Binding',
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
  /operator-delegated-ai-company-durable-memory-item-planning-001/,
  /approve-ai-company-durable-memory-item-planning-only/,
  /planning only for one deterministic local schema-v14 durable stored MemoryItem/,
  /recompute the DEC-118 response-only MemoryCandidate/,
  /schemaVersion = 14/,
  /sequences\.memoryItem/,
  /memoryItems\{\}/,
  /Migration.*creates no MemoryItem/,
  /status: stored/,
  /decision: store/,
  /reviewed-memory-candidate-for-local-project-storage/,
  /source-readiness-was-not-storage-approval/,
  /GET \/api\/learning-candidates\/:learningCandidateId\/memory-item/,
  /POST \/api\/learning-candidates\/:learningCandidateId\/persist-memory-item/,
  /Planning-only authority: accepted as `DEC-119`/,
  /Complete fielded implementation handoff: documented as `DEC-120`/,
  /implementation: accepted as `DEC-121`/,
]);

assert.match(
  handoff,
  /^# AI Company Durable MemoryItem Implementation Decision Handoff$/m,
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
  /operator-decision-ai-company-durable-memory-item-implementation-001/,
  /approve-ai-company-durable-memory-item-implementation-slice/,
  /one deterministic local schema-v14 durable stored MemoryItem/,
  /recompute the DEC-118 response-only preview instead of trusting a browser object/,
  /add schemaVersion 14 memoryItem sequence and memoryItems map only/,
  /scripts\/smoke-ui-slice-664\.mjs/,
  /stillBlockedAuthorities=recommendation retrieval search ranking import apply export deletion/,
  /approval approved continue do everything approve all self approve use your judgment/,
]);

assert.match(decisionLog, /^### DEC-119$/m);
assert.match(decisionLog, /^### DEC-120$/m);
assert.match(decisionLog, /^### DEC-121$/m);
assert.match(masterPlan, /Durable MemoryItem persistence planning-only authority는 `DEC-119`/);
assert.match(runtimeContract, /Durable MemoryItem persistence planning은 `DEC-119`/);
assert.match(councilProtocol, /Durable MemoryItem persistence planning은 `DEC-119`/);
assertAll(roadmapText, [
  /Durable MemoryItem persistence planning-only authority는 `DEC-119`/,
  /implementation decision handoff는 `DEC-120`/,
  /exact implementation은 `DEC-121`/,
]);
assert.match(
  completionInventory,
  /AI Company durable MemoryItem persistence \| pass/,
);
assertAll(readmeText, [
  /Durable MemoryItem persistence planning-only authority is accepted by `DEC-119`/,
  /complete fielded implementation handoff is recorded by `DEC-120`/,
  /`DEC-121` accepts the exact schema-v14 implementation/,
]);
assert.match(taskLedger, /ai-company-durable-memory-item-planning-post-m7-1966/);
assert.match(
  lessons,
  /A durable MemoryItem must preserve the distinction between readiness and storage approval/,
);
assert.match(verification, /id: 'ai-company-durable-memory-item-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-durable-memory-item-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 15/);
assert.match(contracts, /memoryItem: 0/);
assert.match(fileStore, /validateMemoryItemRecords/);
assert.match(runtimeService, /function previewLearningCandidateMemory\(/);
assert.match(runtimeService, /function persistLearningCandidateMemoryItem\(/);
assert.match(server, /persist-memory-item/);
assert.match(server, /learningCandidateMemoryItemMatch/);
assert.match(ui, /data-action="persist-memory-item"/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-119',
        handoff: 'documented-dec-120',
        implementation: 'accepted-dec-121',
      },
      plannedPath: {
        sourceSchemaVersion: 13,
        plannedSchemaVersion: 14,
        sourceBoundary: 'exact-current-memory-candidate-preview',
        durableRecordType: 'MemoryItem',
        durableRecordStatus: 'stored',
        explicitStorageApprovalRequired: true,
        runtimeRecomputationRequired: true,
      },
      currentRuntime: {
        schemaVersion: 14,
        responseOnlyMemoryCandidate: true,
        durableMemoryItems: true,
        persistenceRoutes: true,
        durableUi: true,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: true,
        durableRecordAllowed: true,
        recommendationRetrievalAllowed: false,
        memoryApplicationAllowed: false,
        exportAllowed: false,
        deletionAllowed: false,
        skillPromotionAllowed: false,
        providerGenerationAllowed: false,
        sourceMutationAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
        releaseAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
