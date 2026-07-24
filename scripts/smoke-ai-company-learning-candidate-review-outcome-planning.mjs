import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ai-company-learning-candidate-review-outcome-planning-smoke';

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

const plan = read('docs/76_ai-company-learning-candidate-review-outcome-plan.md');
const handoff = read(
  'docs/77_ai-company-learning-candidate-review-outcome-implementation-decision-handoff.md',
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

assert.match(plan, /^# AI Company LearningCandidate Review Outcome Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Planned State Schema v13',
  'LearningCandidateReview Contract',
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
  /operator-delegated-ai-company-learning-candidate-review-outcome-planning-001/,
  /approve-ai-company-learning-candidate-review-outcome-planning-only/,
  /planning only for one deterministic local schema-v13 append-only LearningCandidateReview record/,
  /source candidate keeps `reviewerStatus=review-required` and `promotionStatus=proposed`/,
  /schemaVersion = 13/,
  /sequences\.learningCandidateReview/,
  /learningCandidateReviews\{\}/,
  /decision: accepted \| rejected \| changes-requested/,
  /GET \/api\/learning-candidates\/:learningCandidateId\/review/,
  /POST \/api\/learning-candidates\/:learningCandidateId\/review/,
  /Planning-only authority: accepted as `DEC-113`/,
  /Complete fielded implementation handoff: documented as `DEC-114`/,
  /Implementation authority: accepted as `DEC-115`/,
  /Current runtime is schema v13/,
]);

assert.match(
  handoff,
  /^# AI Company LearningCandidate Review Outcome Implementation Decision Handoff$/m,
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
  /operator-decision-ai-company-learning-candidate-review-outcome-implementation-001/,
  /approve-ai-company-learning-candidate-review-outcome-implementation-slice/,
  /one deterministic local schema-v13 append-only LearningCandidateReview record/,
  /source candidate must remain immutable/,
  /add schemaVersion 13 learningCandidateReview sequence and learningCandidateReviews map only/,
  /scripts\/smoke-ui-slice-662\.mjs/,
  /stillBlockedAuthorities=LearningCandidate rewrite deletion supersession/,
  /approval approved continue do everything approve all self approve use your judgment/,
]);

assert.match(decisionLog, /^### DEC-113$/m);
assert.match(decisionLog, /^### DEC-114$/m);
assert.match(decisionLog, /^### DEC-115$/m);
assert.match(masterPlan, /LearningCandidate review outcome planning-only authority는 `DEC-113`/);
assert.match(runtimeContract, /LearningCandidate review outcome planning은 `DEC-113`/);
assert.match(councilProtocol, /LearningCandidate review outcome planning은 `DEC-113`/);
assertAll(roadmapText, [
  /LearningCandidate review outcome planning-only authority는 `DEC-113`/,
  /implementation decision handoff는 `DEC-114`/,
]);
assert.match(
  completionInventory,
  /AI Company LearningCandidate review outcome planning \| pass/,
);
assertAll(readmeText, [
  /LearningCandidate review outcome planning-only authority is accepted by `DEC-113`/,
  /complete fielded implementation handoff is recorded by `DEC-114`/,
]);
assert.match(
  taskLedger,
  /ai-company-learning-candidate-review-outcome-planning-post-m7-1962/,
);
assert.match(
  lessons,
  /A candidate review should be an append-only fact instead of a rewrite of immutable learning evidence/,
);
assert.match(
  verification,
  /id: 'ai-company-learning-candidate-review-outcome-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-learning-candidate-review-outcome-planning\.mjs'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-learning-candidate-review-outcome\.mjs'/,
);
assert.match(verification, /script: 'scripts\/smoke-ui-slice-662\.mjs'/);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 19/);
assert.match(contracts, /learningCandidateReview/);
assert.match(fileStore, /validateLearningCandidateReviewRecords/);
assert.match(runtimeService, /function reviewLearningCandidate\(/);
assert.match(server, /learningCandidateReviewMatch/);
assert.match(ui, /data-action="review-learning-candidate"/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-113',
        handoff: 'documented-dec-114',
        implementation: 'accepted-dec-115',
      },
      plannedPath: {
        sourceSchemaVersion: 12,
        plannedSchemaVersion: 13,
        sourceCandidateImmutable: true,
        recordType: 'LearningCandidateReview',
        allowedDecisions: ['accepted', 'rejected', 'changes-requested'],
        explicitOperatorReviewRequired: true,
      },
      currentRuntime: {
        schemaVersion: 13,
        durableLearningCandidates: true,
        reviewRecords: true,
        reviewRoutes: true,
        reviewUi: true,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        candidateReviewAllowed: true,
        candidateMutationAllowed: false,
        expiryOrQuarantineAllowed: false,
        memoryPersistenceAllowed: false,
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
