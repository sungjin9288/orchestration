import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-learning-candidate-preview-planning-smoke';

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

const plan = read('docs/72_ai-company-learning-candidate-preview-plan.md');
const handoff = read(
  'docs/73_ai-company-learning-candidate-preview-implementation-decision-handoff.md',
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
const learningCandidateCompiler = read('src/runtime/learning-candidate-preview.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const ui = read('ui/app.js');

const planText = compact(plan);
const handoffText = compact(handoff);
const roadmapText = compact(roadmap);
const readmeText = compact(readme);

assert.match(plan, /^# AI Company LearningCandidate Preview Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Operator RetrospectiveSpec Contract',
  'Planned Response-Only Contract',
  'Digest And Idempotency Binding',
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
  'Verification',
]);
assertAll(planText, [
  /operator-delegated-ai-company-learning-candidate-preview-planning-001/,
  /approve-ai-company-learning-candidate-preview-planning-only/,
  /planning only for one deterministic response-only LearningCandidate preview/,
  /operator-owned `retrospectiveSpec`/,
  /source-contained applicability scope/,
  /at least one evidence-bound negative-evidence statement/,
  /redactionAcknowledgement: source-summary-only/,
  /redactionMode: source-summary-only/,
  /redactionStatus: review-required/,
  /not proof that arbitrary operator text is secret-free/,
  /persisted: false/,
  /reviewerStatus: review-required/,
  /promotionStatus: proposed/,
  /POST \/api\/missions\/:missionId\/learning-candidate-preview/,
  /never calls `saveState`/,
  /Keep `STATE_SCHEMA_VERSION = 11`/,
  /Planning-only authority: accepted as `DEC-107`/,
  /Complete fielded implementation handoff: documented as `DEC-108`/,
  /implementation: accepted and implemented as `DEC-109`/,
]);

assert.match(
  handoff,
  /^# AI Company LearningCandidate Preview Implementation Decision Handoff$/m,
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
  /operator-decision-ai-company-learning-candidate-preview-implementation-001/,
  /approve-ai-company-learning-candidate-preview-implementation-slice/,
  /one deterministic response-only LearningCandidate preview/,
  /keep STATE_SCHEMA_VERSION 11/,
  /zero saveState and byte mutation/,
  /redactionStatus=review-required/,
  /scripts\/smoke-ui-slice-660\.mjs/,
  /stillBlockedAuthorities=schema-v12 migration/,
  /`approval`.*`approved`.*`continue`.*`do everything`.*`approve all`.*`self approve`.*`use your judgment`/,
]);

assert.match(decisionLog, /^### DEC-107$/m);
assert.match(decisionLog, /^### DEC-108$/m);
assert.match(decisionLog, /^### DEC-109$/m);
assert.match(masterPlan, /exact response-only implementation은 `DEC-109`/);
assert.match(runtimeContract, /exact\s+response-only implementation은 `DEC-109`/);
assert.match(councilProtocol, /exact response-only implementation은 `DEC-109`/);
assertAll(roadmapText, [
  /Phase 8 LearningCandidate preview planning-only authority는 `DEC-107`/,
  /implementation decision handoff는 `DEC-108`/,
  /exact response-only implementation은 `DEC-109`/,
]);
assert.match(
  completionInventory,
  /AI Company LearningCandidate preview planning \| pass/,
);
assert.match(
  completionInventory,
  /AI Company LearningCandidate preview implementation \| pass/,
);
assertAll(readmeText, [
  /LearningCandidate preview planning-only authority is accepted by `DEC-107`/,
  /implementation handoff is recorded by `DEC-108`/,
  /exact response-only implementation is accepted by `DEC-109`/,
  /schema v11 unchanged/,
]);
assert.match(
  taskLedger,
  /ai-company-learning-candidate-preview-planning-post-m7-1958/,
);
assert.match(
  taskLedger,
  /ai-company-learning-candidate-preview-implementation-post-m7-1959/,
);
assert.match(
  lessons,
  /A first LearningCandidate slice should validate operator-authored retrospective content against closed Mission evidence instead of inventing a lesson or opening persistence/,
);
assert.match(verification, /id: 'ai-company-learning-candidate-preview-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-learning-candidate-preview-planning\.mjs'/,
);
assert.match(verification, /id: 'ai-company-learning-candidate-preview-implementation'/);
assert.match(verification, /id: 'ai-company-learning-candidate-preview-ui-api'/);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 12/);
assert.match(contracts, /learningCandidate: 0/);
assert.match(learningCandidateCompiler, /function compileLearningCandidatePreview\(/);
assert.match(runtimeService, /function previewMissionLearningCandidate\(/);
assert.match(server, /learning-candidate-preview/);
assert.match(ui, /data-action="preview-learning-candidate"/);
assert.doesNotMatch(server, /method === 'GET'.*learning-candidate-preview/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-107',
        handoff: 'documented-dec-108',
        implementation: 'accepted-dec-109',
      },
      plannedPath: {
        sourceSchemaVersion: 11,
        plannedSchemaVersion: 11,
        sourceBoundary: 'exact-terminal-mission-evidence',
        input: 'operator-owned-retrospective-spec',
        output: 'response-only-learning-candidate-preview',
        persisted: false,
      },
      currentRuntime: {
        schemaVersion: 12,
        learningCandidateCompiler: true,
        learningCandidateRoute: true,
        learningCandidateUiPreview: true,
        learningCandidatePersistence: true,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        durableCandidateAllowed: true,
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
