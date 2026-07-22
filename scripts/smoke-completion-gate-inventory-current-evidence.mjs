import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countScripts(predicate) {
  return fs.readdirSync(path.join(repoRoot, 'scripts')).filter(predicate).length;
}

const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const verificationStatus = read('scripts/verification_status.mjs');
const uiQaStatus = read('scripts/ui_qa_status.mjs');

const smokeFileCount = countScripts((name) => /^smoke-.*\.mjs$/.test(name));
const uiSmokeFileCount = countScripts((name) => /^smoke-ui-slice-.*\.mjs$/.test(name));

function assertInventoryHas(pattern) {
  assert.match(inventory, pattern);
}

function assertInventoryDoesNotHave(pattern) {
  assert.doesNotMatch(inventory, pattern);
}

function assertReadmeHas(pattern) {
  assert.match(readme, pattern);
}

const inventoryGateRows = [
  /Recent evidence refresh head checked before this document update: `d3f7a5d`/,
  /\| Required aggregate synthetic gate \| pass \| `node scripts\/verification_status\.mjs` \| Current aggregate count is source-checked by this inventory smoke\. \| Keep as the default required docs\/runtime aggregate gate\. \|/,
  /\| UI QA synthetic gate \| pass \| `node scripts\/ui_qa_status\.mjs` \| `ok=true`; required `48\/48`; snapshot reachability informational skipped when the local UI server is not running \| Treat snapshot reachability as optional unless a UI server is intentionally started\. \|/,
  /\| Completion gate inventory current evidence \| pass \| `node scripts\/smoke-completion-gate-inventory-current-evidence\.mjs`, `node scripts\/verification_status\.mjs` \| Current-head inventory evidence is pinned to aggregate registration, UI QA `48\/48`, zero-open backlog, post-completion router, proposal-record lifecycle review alias boundaries, AI Company durable lifecycle evidence, schema-v16 acceptance\/proof evidence, bounded continuation, optional exact fetch, and context telemetry \| Keep this smoke in aggregate so gate inventory counts do not drift behind README, UI QA, or growth routing evidence\. \|/,
  /\| vNext proposal generation decision packet \| pass \| `docs\/40_proposal-generation-decision-packet\.md`, `node scripts\/vnext-proposal-generation-decision-packet-status\.mjs` \|/,
  /\| vNext proposal generation operator decision handoff \| pass \| `docs\/41_proposal-generation-operator-decision-handoff\.md`, `node scripts\/vnext-proposal-generation-operator-decision-handoff-status\.mjs` \|/,
  /\| vNext proposal generation planning plan \| pass \| `docs\/42_proposal-generation-planning-plan\.md`, `node scripts\/vnext-proposal-generation-planning-plan-status\.mjs` \|/,
  /\| vNext proposal generation implementation \| pass \| `docs\/43_proposal-generation-implementation\.md`, `node scripts\/smoke-deterministic-proposal-draft-generation\.mjs`, `node scripts\/vnext-proposal-generation-implementation-status\.mjs` \|/,
  /\| vNext proposal draft human review \| pass \| `docs\/44_proposal-draft-human-review\.md`, `node scripts\/smoke-proposal-draft-human-review\.mjs`, `node scripts\/vnext-proposal-draft-human-review-status\.mjs` \|/,
  /\| vNext proposal draft human review decision packet \| pass \| `docs\/45_proposal-draft-human-review-decision-packet\.md`, `node scripts\/vnext-proposal-draft-human-review-decision-packet-status\.mjs` \|/,
  /\| vNext proposal draft human review evidence decision \| pass \| `docs\/46_proposal-draft-human-review-evidence-decision\.md`, `node scripts\/vnext-proposal-draft-human-review-evidence-decision-status\.mjs` \|/,
  /\| vNext proposal draft downstream authority decision packet \| pass \| `docs\/47_proposal-draft-downstream-authority-decision-packet\.md`, `node scripts\/vnext-proposal-draft-downstream-authority-decision-packet-status\.mjs` \|/,
  /\| AI Company runtime blueprint planning \| pass \| `docs\/52_ai-company-runtime-blueprint-implementation-plan\.md`, `docs\/53_ai-company-runtime-blueprint-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-runtime-blueprint-planning\.mjs` \|/,
  /\| AI Company runtime blueprint implementation \| pass \| `company\/blueprint\.json`, `company\/roles\/\*\.md`, `src\/runtime\/company-blueprint\.js`, `node scripts\/smoke-ai-company-runtime-blueprint\.mjs` \|/,
  /\| AI Company Real Council planning \| pass \| `docs\/54_ai-company-real-council-implementation-plan\.md`, `docs\/55_ai-company-real-council-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-real-council-planning\.mjs` \|/,
  /\| AI Company Real Council implementation \| pass \| `src\/runtime\/council-sessions\.js`, `src\/execution\/council-coordinator\.js`, `src\/execution\/providers\/council-local-stub-adapter\.js`, `node scripts\/smoke-ai-company-real-council\.mjs`, `node scripts\/smoke-ui-slice-651\.mjs` \|/,
  /\| AI Company Council live-provider implementation \| pass \| `DEC-085`, `node scripts\/smoke-ai-company-council-live-provider\.mjs`, `node scripts\/smoke-ui-slice-652\.mjs`, optional `node scripts\/smoke-ai-company-council-live-provider-live\.mjs` \|/,
  /\| AI Company Mission compiler and inert WorkOrder planning \| pass \| `docs\/58_ai-company-mission-workorder-compiler-implementation-plan\.md`, `docs\/59_ai-company-mission-workorder-compiler-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-mission-workorder-compiler-planning\.mjs` \|/,
  /\| AI Company Mission compiler and inert WorkOrder implementation \| pass \| `DEC-088`, `src\/runtime\/mission-workorder-compiler\.js`, `node scripts\/smoke-ai-company-mission-workorder-compiler\.mjs`, `node scripts\/smoke-ui-slice-653\.mjs` \|/,
  /\| AI Company WorkOrder persistence and sequential execution planning \| pass \| `docs\/60_ai-company-workorder-persistence-execution-plan\.md`, `docs\/61_ai-company-workorder-persistence-execution-decision-handoff\.md`, `node scripts\/smoke-ai-company-workorder-persistence-execution-planning\.mjs` \|/,
  /\| AI Company WorkOrder persistence and sequential execution implementation \| pass \| `DEC-091`, `node scripts\/smoke-ai-company-workorder-persistence-execution\.mjs`, `node scripts\/smoke-ui-slice-654\.mjs` \|/,
  /\| AI Company reviewed-delivery planning \| pass \| `docs\/62_ai-company-reviewed-delivery-planning-plan\.md`, `docs\/63_ai-company-reviewed-delivery-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-reviewed-delivery-planning\.mjs` \|/,
  /\| AI Company reviewed-delivery implementation \| pass \| `DEC-094`, `src\/execution\/qa-node-check-runner\.js`, `node scripts\/smoke-ai-company-reviewed-delivery\.mjs`, `node scripts\/smoke-ui-slice-655\.mjs` \|/,
  /\| AI Company checkpoint resume and recovery implementation \| pass \| `DEC-097`, `docs\/64_ai-company-checkpoint-resume-recovery-plan\.md`, `node scripts\/smoke-ai-company-checkpoint-resume-recovery\.mjs`, `node scripts\/smoke-ui-slice-656\.mjs` \|/,
  /\| AI Company durable DeliveryPackage persistence planning \| pass \| `docs\/66_ai-company-durable-delivery-package-persistence-plan\.md`, `docs\/67_ai-company-durable-delivery-package-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-delivery-package-planning\.mjs` \|/,
  /\| AI Company durable DeliveryPackage persistence implementation \| pass \| `DEC-100`, `node scripts\/smoke-ai-company-durable-delivery-package\.mjs`, `node scripts\/smoke-ui-slice-657\.mjs` \|/,
  /\| AI Company DeliveryPackage acceptance planning \| pass \| `docs\/68_ai-company-delivery-package-acceptance-plan\.md`, `docs\/69_ai-company-delivery-package-acceptance-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-delivery-package-acceptance-planning\.mjs` \|/,
  /\| AI Company DeliveryPackage acceptance implementation \| pass \| `DEC-103`, `node scripts\/smoke-ai-company-delivery-package-acceptance\.mjs`, `node scripts\/smoke-ui-slice-658\.mjs` \|/,
  /\| AI Company Mission and task close-out planning \| pass \| `docs\/70_ai-company-mission-task-close-out-plan\.md`, `docs\/71_ai-company-mission-task-close-out-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-mission-task-close-out-planning\.mjs` \|/,
  /\| AI Company Mission and task close-out implementation \| pass \| `DEC-106`, `node scripts\/smoke-ai-company-mission-task-close-out\.mjs`, `node scripts\/smoke-ui-slice-659\.mjs` \|/,
  /\| AI Company LearningCandidate preview planning \| pass \| `docs\/72_ai-company-learning-candidate-preview-plan\.md`, `docs\/73_ai-company-learning-candidate-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-learning-candidate-preview-planning\.mjs` \|/,
  /\| AI Company LearningCandidate preview implementation \| pass \| `DEC-109`, `src\/runtime\/file-store\.js`, `src\/runtime\/learning-candidate-preview\.js`, `node scripts\/smoke-ai-company-learning-candidate-preview\.mjs`, `node scripts\/smoke-ui-slice-660\.mjs` \|/,
  /\| AI Company durable LearningCandidate persistence planning \| pass \| `docs\/74_ai-company-durable-learning-candidate-persistence-plan\.md`, `docs\/75_ai-company-durable-learning-candidate-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-learning-candidate-planning\.mjs` \|/,
  /\| AI Company durable LearningCandidate persistence implementation \| pass \| `DEC-112`, `src\/runtime\/learning-candidates\.js`, `node scripts\/smoke-ai-company-durable-learning-candidate\.mjs`, `node scripts\/smoke-ui-slice-661\.mjs` \|/,
  /\| AI Company LearningCandidate review outcome planning \| pass \| `docs\/76_ai-company-learning-candidate-review-outcome-plan\.md`, `docs\/77_ai-company-learning-candidate-review-outcome-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-learning-candidate-review-outcome-planning\.mjs` \|/,
  /\| AI Company LearningCandidate review outcome implementation \| pass \| `DEC-115`, `src\/runtime\/learning-candidate-reviews\.js`, `node scripts\/smoke-ai-company-learning-candidate-review-outcome\.mjs`, `node scripts\/smoke-ui-slice-662\.mjs` \|/,
  /\| AI Company MemoryCandidate preview planning \| pass \| `docs\/78_ai-company-memory-candidate-preview-plan\.md`, `docs\/79_ai-company-memory-candidate-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-memory-candidate-preview-planning\.mjs` \|/,
  /\| AI Company MemoryCandidate preview implementation \| pass \| `DEC-118`, `src\/runtime\/memory-candidate-preview\.js`, `node scripts\/smoke-ai-company-memory-candidate-preview\.mjs`, `node scripts\/smoke-ui-slice-663\.mjs` \|/,
  /\| AI Company durable MemoryItem persistence \| pass \| `docs\/80_ai-company-durable-memory-item-persistence-plan\.md`, `docs\/81_ai-company-durable-memory-item-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-memory-item-planning\.mjs`, `node scripts\/smoke-ai-company-durable-memory-item\.mjs`, `node scripts\/smoke-ui-slice-664\.mjs` \|/,
  /\| AI Company MemoryRecall preview planning \| pass \| `docs\/82_ai-company-memory-recall-preview-plan\.md`, `docs\/83_ai-company-memory-recall-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-memory-recall-preview-planning\.mjs` \|/,
  /\| AI Company MemoryRecall preview implementation \| pass \| `DEC-124`, `src\/runtime\/memory-recall-preview\.js`, `node scripts\/smoke-ai-company-memory-recall-preview\.mjs`, `node scripts\/smoke-ui-slice-665\.mjs` \|/,
  /\| AI Company durable MemoryRecall persistence planning \| pass \| `docs\/84_ai-company-durable-memory-recall-persistence-plan\.md`, `docs\/85_ai-company-durable-memory-recall-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-memory-recall-planning\.mjs` \|/,
  /\| AI Company durable MemoryRecall persistence implementation \| pass \| `DEC-127`, `src\/runtime\/memory-recalls\.js`, `node scripts\/smoke-ai-company-durable-memory-recall\.mjs`, `node scripts\/smoke-ui-slice-666\.mjs` \|/,
  /\| AI Company Mission memory context preview planning \| pass \| `docs\/86_ai-company-mission-memory-context-preview-plan\.md`, `docs\/87_ai-company-mission-memory-context-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-mission-memory-context-preview-planning\.mjs` \|/,
  /\| AI Company Mission memory context preview implementation \| pass \| `DEC-130`, `src\/runtime\/mission-memory-context-preview\.js`, `node scripts\/smoke-ai-company-mission-memory-context-preview\.mjs`, `node scripts\/smoke-ui-slice-667\.mjs` \|/,
  /\| WorkOrder verification plan preview \| pass \| `DEC-131`, `docs\/88_external-pattern-native-adoption-plan\.md`, `node scripts\/smoke-ai-company-workorder-verification-plan-preview\.mjs`, `node scripts\/smoke-ui-slice-668\.mjs` \|/,
  /\| Runtime state transaction guard \| pass \| `DEC-132`, `src\/runtime\/file-store\.js`, `node scripts\/smoke-state-transaction-guard\.mjs` \|/,
  /\| AcceptanceCriterion and VerificationProof ledger \| pass \| `DEC-133`, `src\/runtime\/acceptance-criteria\.js`, `src\/runtime\/verification-proofs\.js`, `node scripts\/smoke-ai-company-acceptance-criterion-proof\.mjs`, `node scripts\/smoke-ui-slice-669\.mjs` \|/,
  /\| Bounded continuation preview \| pass \| `DEC-134`, `src\/runtime\/execution-continuation-preview\.js`, `node scripts\/smoke-ai-company-bounded-continuation\.mjs`, `node scripts\/smoke-ui-slice-670\.mjs` \|/,
  /\| Optional wigolo exact fetch \| pass \| `DEC-135`, `src\/research\/wigolo-exact-fetch-adapter\.js`, `node scripts\/smoke-wigolo-exact-fetch-adapter\.mjs`, `node scripts\/smoke-wigolo-exact-fetch-live\.mjs` \|/,
  /\| Context budget telemetry \| pass \| `DEC-136`, `src\/runtime\/context-budget-telemetry\.js`, `node scripts\/smoke-context-budget-telemetry\.mjs` \|/,
];

const lifecycleAliasEvidence = [
  /Growth status and reflection now route the zero-open baseline through the short read-only alias `growth-evidence-ledger-proposal-record-lifecycle-review`/,
  /preserve the longer repeated route as `sourceCandidate` evidence/,
  /growth engine routing now keeps the next default vNext workstream on\s+`growth-evidence-ledger-proposal-record-lifecycle-review`/,
  /Maintain the alias unless engine or reflection evidence drifts/i,
];

const staleInventoryEvidence = [
  /informational `161\/161`; total `162\/162`/,
  /required `27\/27`/,
  /after the 1916 short-alias/,
];

for (const pattern of inventoryGateRows) {
  assertInventoryHas(pattern);
}

for (const pattern of lifecycleAliasEvidence) {
  assertInventoryHas(pattern);
}

for (const pattern of staleInventoryEvidence) {
  assertInventoryDoesNotHave(pattern);
}

assertReadmeHas(new RegExp(`${smokeFileCount} smoke files`));
assertReadmeHas(new RegExp(`${uiSmokeFileCount} UI smoke files`));
assertReadmeHas(/total `243\/243`/);
assert.match(verificationStatus, /completion-gate-inventory-current-evidence/);
assert.match(verificationStatus, /smoke-completion-gate-inventory-current-evidence\.mjs/);
assert.match(verificationStatus, /ai-company-workorder-persistence-execution-planning/);
assert.match(verificationStatus, /ai-company-workorder-persistence-execution-implementation/);
assert.match(verificationStatus, /ai-company-reviewed-delivery-planning/);
assert.match(verificationStatus, /ai-company-reviewed-delivery-implementation/);
assert.match(verificationStatus, /ai-company-reviewed-delivery-ui-api/);
assert.match(verificationStatus, /ai-company-checkpoint-resume-recovery-planning/);
assert.match(verificationStatus, /ai-company-checkpoint-resume-recovery-implementation/);
assert.match(verificationStatus, /ai-company-checkpoint-resume-recovery-ui-api/);
assert.match(verificationStatus, /ai-company-durable-delivery-package-planning/);
assert.match(verificationStatus, /ai-company-durable-delivery-package-implementation/);
assert.match(verificationStatus, /ai-company-durable-delivery-package-ui-api/);
assert.match(verificationStatus, /ai-company-delivery-package-acceptance-planning/);
assert.match(verificationStatus, /ai-company-delivery-package-acceptance-implementation/);
assert.match(verificationStatus, /ai-company-delivery-package-acceptance-ui-api/);
assert.match(verificationStatus, /ai-company-mission-task-close-out-planning/);
assert.match(verificationStatus, /ai-company-mission-task-close-out-implementation/);
assert.match(verificationStatus, /ai-company-mission-task-close-out-ui-api/);
assert.match(verificationStatus, /ai-company-learning-candidate-preview-planning/);
assert.match(verificationStatus, /ai-company-learning-candidate-preview-implementation/);
assert.match(verificationStatus, /ai-company-learning-candidate-preview-ui-api/);
assert.match(verificationStatus, /ai-company-durable-learning-candidate-planning/);
assert.match(verificationStatus, /ai-company-durable-learning-candidate-implementation/);
assert.match(verificationStatus, /ai-company-durable-learning-candidate-ui-api/);
assert.match(verificationStatus, /ai-company-learning-candidate-review-outcome-planning/);
assert.match(verificationStatus, /ai-company-learning-candidate-review-outcome-implementation/);
assert.match(verificationStatus, /ai-company-learning-candidate-review-outcome-ui-api/);
assert.match(verificationStatus, /ai-company-memory-candidate-preview-planning/);
assert.match(verificationStatus, /ai-company-memory-candidate-preview-implementation/);
assert.match(verificationStatus, /ai-company-memory-candidate-preview-ui-api/);
assert.match(verificationStatus, /ai-company-durable-memory-item-planning/);
assert.match(verificationStatus, /ai-company-memory-recall-preview-planning/);
assert.match(verificationStatus, /ai-company-memory-recall-preview-implementation/);
assert.match(verificationStatus, /ai-company-memory-recall-preview-ui-api/);
assert.match(verificationStatus, /ai-company-durable-memory-recall-planning/);
assert.match(verificationStatus, /ai-company-durable-memory-recall-implementation/);
assert.match(verificationStatus, /ai-company-durable-memory-recall-ui-api/);
assert.match(verificationStatus, /ai-company-mission-memory-context-preview-planning/);
assert.match(verificationStatus, /ai-company-mission-memory-context-preview-implementation/);
assert.match(verificationStatus, /ai-company-mission-memory-context-preview-ui-api/);
assert.match(uiQaStatus, /smoke-ui-slice-651\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-652\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-653\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-654\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-655\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-656\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-657\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-658\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-659\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-660\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-661\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-662\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-663\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-664\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-665\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-666\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-668\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-669\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-670\.mjs/);
assert.match(verificationStatus, /smoke-state-transaction-guard\.mjs/);
assert.match(verificationStatus, /smoke-wigolo-exact-fetch-adapter\.mjs/);
assert.match(verificationStatus, /smoke-context-budget-telemetry\.mjs/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'smoke-completion-gate-inventory-current-evidence',
      smokeFileCount,
      uiSmokeFileCount,
      aggregate: {
        required: '1/1',
        informational: '242/242',
        total: '243/243',
      },
    },
    null,
    2,
  )}\n`,
);
