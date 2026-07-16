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
  /Recent evidence refresh head checked before this document update: `10301cd`/,
  /\| Required aggregate synthetic gate \| pass \| `node scripts\/verification_status\.mjs` \| Current aggregate count is source-checked by this inventory smoke\. \| Keep as the default required docs\/runtime aggregate gate\. \|/,
  /\| UI QA synthetic gate \| pass \| `node scripts\/ui_qa_status\.mjs` \| `ok=true`; required `35\/35`; snapshot reachability informational skipped when the local UI server is not running \| Treat snapshot reachability as optional unless a UI server is intentionally started\. \|/,
  /\| Completion gate inventory current evidence \| pass \| `node scripts\/smoke-completion-gate-inventory-current-evidence\.mjs`, `node scripts\/verification_status\.mjs` \| Current-head inventory evidence is pinned to aggregate registration, UI QA `35\/35`, zero-open backlog, post-completion router, proposal-record lifecycle review alias boundaries, proposal generation evidence, AI Company Phase 5-7 evidence, durable DeliveryPackage implementation, and package acceptance planning evidence \| Keep this smoke in aggregate so gate inventory counts do not drift behind README, UI QA, or growth routing evidence\. \|/,
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
assertReadmeHas(/total `204\/204`/);
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
assert.match(uiQaStatus, /smoke-ui-slice-651\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-652\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-653\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-654\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-655\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-656\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-657\.mjs/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'smoke-completion-gate-inventory-current-evidence',
      smokeFileCount,
      uiSmokeFileCount,
      aggregate: {
        required: '1/1',
        informational: '203/203',
        total: '204/204',
      },
    },
    null,
    2,
  )}\n`,
);
