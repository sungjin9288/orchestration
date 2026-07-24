import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ai-company-memory-candidate-preview-planning-smoke';

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

const plan = read('docs/78_ai-company-memory-candidate-preview-plan.md');
const handoff = read(
  'docs/79_ai-company-memory-candidate-preview-implementation-decision-handoff.md',
);
const memorySpec = read('docs/25_memory-readiness-decision-spec.md');
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
const memoryCandidatePreview = read('src/runtime/memory-candidate-preview.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const ui = read('ui/app.js');

const planText = compact(plan);
const handoffText = compact(handoff);
const memorySpecText = compact(memorySpec);
const readmeText = compact(readme);
const roadmapText = compact(roadmap);

assert.match(plan, /^# AI Company MemoryCandidate Preview Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'MemoryCandidate Preview Contract',
  'Operator MemorySpec',
  'Digest And Idempotency Binding',
  'Runtime And API Plan',
  'UI Boundary',
  'Compatibility',
  'Focused Verification Plan',
  'Rollback Plan',
  'Implementation Target Surface',
  'Acceptance Criteria',
  'Exclusions',
  'Planning Status',
  'Verification',
]);
assertAll(planText, [
  /operator-delegated-ai-company-memory-candidate-preview-planning-001/,
  /approve-ai-company-memory-candidate-preview-planning-only/,
  /response-only AI Company MemoryCandidate preview/,
  /LearningCandidateReview\(decision=accepted\)/,
  /rejected.*changes-requested.*terminal evidence/,
  /persisted: false/,
  /status: review-ready/,
  /storageStatus: not-approved/,
  /promotionStatus: blocked/,
  /nonPersistenceStatement: readiness-only-not-durable-memory/,
  /POST \/api\/learning-candidates\/:learningCandidateId\/memory-candidate-preview/,
  /Planning-only authority: accepted as `DEC-116`/,
  /Complete fielded implementation handoff: documented as `DEC-117`/,
  /Current runtime remains schema v13/,
]);

assert.match(
  handoff,
  /^# AI Company MemoryCandidate Preview Implementation Decision Handoff$/m,
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
  'Implementation Outcome',
]);
assertAll(handoffText, [
  /operator-decision-ai-company-memory-candidate-preview-implementation-001/,
  /approve-ai-company-memory-candidate-preview-implementation-slice/,
  /one deterministic response-only AI Company MemoryCandidate preview/,
  /source-current accepted schema-v13 LearningCandidateReview/,
  /keep schemaVersion 13/,
  /scripts\/smoke-ui-slice-663\.mjs/,
  /stillBlockedAuthorities=schema-v14 migration/,
  /approval approved continue do everything approve all self approve use your judgment/,
  /`DEC-118` accepts only the bounded response-only runtime\/API\/UI slice/,
]);

assertAll(memorySpecText, [
  /Readiness review: evaluates whether a candidate is worth considering\. It does not persist memory/,
  /Storage approval: authorizes writing a durable memory item/,
  /Memory readiness, memory storage, memory export, memory deletion, and skill promotion are separate gates/,
  /Raw transcripts must not be ingested by default/,
  /cross-workspace memory attempt/,
]);

assert.match(decisionLog, /^### DEC-116$/m);
assert.match(decisionLog, /^### DEC-117$/m);
assert.match(decisionLog, /^### DEC-118$/m);
assert.match(masterPlan, /MemoryCandidate preview planning-only authority는 `DEC-116`/);
assert.match(runtimeContract, /MemoryCandidate preview planning은 `DEC-116`/);
assert.match(councilProtocol, /MemoryCandidate preview planning은 `DEC-116`/);
assertAll(roadmapText, [
  /MemoryCandidate preview planning-only authority는 `DEC-116`/,
  /implementation decision handoff는 `DEC-117`/,
  /implementation은 `DEC-118`/,
]);
assert.match(
  completionInventory,
  /AI Company MemoryCandidate preview planning \| pass/,
);
assertAll(readmeText, [
  /MemoryCandidate preview planning-only authority is accepted by `DEC-116`/,
  /complete fielded implementation handoff is recorded by `DEC-117`/,
  /exact response-only implementation is accepted by `DEC-118`/,
  /current path keeps schema v13 unchanged and accepts only one exact source-current unexpired LearningCandidate/,
]);
assert.match(
  taskLedger,
  /ai-company-memory-candidate-preview-planning-post-m7-1964/,
);
assert.match(
  lessons,
  /An accepted learning review is evidence for memory readiness, not storage approval/,
);
assert.match(
  verification,
  /id: 'ai-company-memory-candidate-preview-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-memory-candidate-preview-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 19/);
assert.match(contracts, /learningCandidateReviews: \{\}/);
assert.doesNotMatch(contracts, /memoryCandidateReviews: \{\}/);
assert.match(memoryCandidatePreview, /function previewLearningCandidateMemory\(/);
assert.match(memoryCandidatePreview, /persisted: false/);
assert.match(runtimeService, /previewLearningCandidateMemory\(input\)/);
assert.match(server, /learningCandidateMemoryPreviewMatch/);
assert.match(ui, /data-action="preview-memory-candidate"/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-116',
        handoff: 'documented-dec-117',
        implementation: 'accepted-dec-118',
      },
      plannedPath: {
        sourceSchemaVersion: 13,
        plannedSchemaVersion: 13,
        sourceReviewDecision: 'accepted',
        responseOnly: true,
        persisted: false,
        status: 'review-ready',
        browserMemoryOnly: true,
      },
      currentRuntime: {
        schemaVersion: 13,
        durableLearningCandidates: true,
        learningCandidateReviews: true,
        memoryCandidatePreview: true,
        durableMemory: false,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        memoryReadinessPreviewAllowed: true,
        memoryPersistenceAllowed: false,
        crossWorkspaceMemoryAllowed: false,
        skillPromotionAllowed: false,
        providerGenerationAllowed: false,
        sourceMutationAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
        releaseAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
