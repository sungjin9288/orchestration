import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-durable-learning-candidate-planning-smoke';

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

const plan = read('docs/74_ai-company-durable-learning-candidate-persistence-plan.md');
const handoff = read(
  'docs/75_ai-company-durable-learning-candidate-implementation-decision-handoff.md',
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

assert.match(plan, /^# AI Company Durable LearningCandidate Persistence Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Planned State Schema v12',
  'Durable LearningCandidate Contract',
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
  /operator-delegated-ai-company-durable-learning-candidate-planning-001/,
  /approve-ai-company-durable-learning-candidate-planning-only/,
  /planning only for one deterministic local schema-v12 durable LearningCandidate review-required record/,
  /recompute the DEC-109 response-only preview/,
  /schemaVersion = 12/,
  /sequences\.learningCandidate/,
  /learningCandidates\{\}/,
  /Migration.*creates no candidate/,
  /status: review-required/,
  /promotionStatus: proposed/,
  /GET \/api\/missions\/:missionId\/learning-candidate/,
  /POST \/api\/missions\/:missionId\/persist-learning-candidate/,
  /Planning-only authority: accepted as `DEC-110`/,
  /Complete fielded implementation handoff: documented as `DEC-111`/,
  /implementation: accepted as `DEC-112` and verified on schema v12/,
]);

assert.match(
  handoff,
  /^# AI Company Durable LearningCandidate Implementation Decision Handoff$/m,
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
  /operator-decision-ai-company-durable-learning-candidate-implementation-001/,
  /approve-ai-company-durable-learning-candidate-implementation-slice/,
  /one deterministic local schema-v12 durable LearningCandidate review-required record/,
  /recompute the DEC-109 response-only preview instead of trusting a browser object/,
  /add schemaVersion 12 learningCandidate sequence and learningCandidates map only/,
  /scripts\/smoke-ui-slice-661\.mjs/,
  /stillBlockedAuthorities=LearningCandidate acceptance rejection changes-requested/,
  /approval approved continue do everything approve all self approve use your judgment/,
]);

assert.match(decisionLog, /^### DEC-110$/m);
assert.match(decisionLog, /^### DEC-111$/m);
assert.match(decisionLog, /^### DEC-112$/m);
assert.match(masterPlan, /Durable LearningCandidate persistence planning-only authority는 `DEC-110`/);
assert.match(runtimeContract, /Durable LearningCandidate persistence planning은 `DEC-110`/);
assert.match(councilProtocol, /Durable LearningCandidate persistence planning은 `DEC-110`/);
assertAll(roadmapText, [
  /Durable LearningCandidate persistence planning-only authority는 `DEC-110`/,
  /implementation decision handoff는 `DEC-111`/,
  /exact implementation은 `DEC-112`/,
]);
assert.match(
  completionInventory,
  /AI Company durable LearningCandidate persistence planning \| pass/,
);
assertAll(readmeText, [
  /Durable LearningCandidate persistence planning-only authority is accepted by `DEC-110`/,
  /complete fielded implementation handoff is recorded by `DEC-111`/,
  /exact implementation is accepted by `DEC-112`/,
]);
assert.match(
  taskLedger,
  /ai-company-durable-learning-candidate-planning-post-m7-1960/,
);
assert.match(
  taskLedger,
  /ai-company-durable-learning-candidate-implementation-post-m7-1961/,
);
assert.match(
  lessons,
  /Persisting a response-only LearningCandidate must recompute the exact current preview/,
);
assert.match(verification, /id: 'ai-company-durable-learning-candidate-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-durable-learning-candidate-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 18/);
assert.match(contracts, /learningCandidate: 0/);
assert.match(fileStore, /validateLearningCandidateRecords/);
assert.match(runtimeService, /function previewMissionLearningCandidate\(/);
assert.match(runtimeService, /function persistMissionLearningCandidate\(/);
assert.match(server, /persist-learning-candidate/);
assert.match(server, /missionLearningCandidateMatch/);
assert.match(ui, /data-action="persist-learning-candidate"/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-110',
        handoff: 'documented-dec-111',
        implementation: 'accepted-dec-112',
      },
      plannedPath: {
        sourceSchemaVersion: 11,
        plannedSchemaVersion: 12,
        sourceBoundary: 'exact-current-learning-candidate-preview',
        durableRecordStatus: 'review-required',
        promotionStatus: 'proposed',
        explicitOperatorRequestRequired: true,
        runtimeRecomputationRequired: true,
      },
      currentRuntime: {
        schemaVersion: 12,
        responseOnlyPreview: true,
        durableLearningCandidateRecords: true,
        persistenceRoutes: true,
        durableUi: true,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        schemaMigrationAllowed: true,
        durableRecordAllowed: true,
        candidateReviewAllowed: false,
        memoryPersistenceAllowed: false,
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
