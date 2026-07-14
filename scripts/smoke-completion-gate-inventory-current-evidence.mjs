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
  /\| UI QA synthetic gate \| pass \| `node scripts\/ui_qa_status\.mjs` \| `ok=true`; required `28\/28`; snapshot reachability informational skipped because local UI server was not running \| Treat snapshot reachability as optional unless a UI server is intentionally started\. \|/,
  /\| Completion gate inventory current evidence \| pass \| `node scripts\/smoke-completion-gate-inventory-current-evidence\.mjs`, `node scripts\/verification_status\.mjs` \| Current-head inventory evidence is pinned to aggregate registration, UI QA `28\/28`, zero-open backlog, post-completion router, proposal-record lifecycle review alias boundaries, and proposal generation planning, implementation, pending human-review, review-decision packet, accepted evidence-decision, plus downstream authority decision-packet evidence \| Keep this smoke in aggregate so gate inventory counts do not drift behind README, UI QA, or growth routing evidence\. \|/,
  /\| vNext proposal generation decision packet \| pass \| `docs\/40_proposal-generation-decision-packet\.md`, `node scripts\/vnext-proposal-generation-decision-packet-status\.mjs` \|/,
  /\| vNext proposal generation operator decision handoff \| pass \| `docs\/41_proposal-generation-operator-decision-handoff\.md`, `node scripts\/vnext-proposal-generation-operator-decision-handoff-status\.mjs` \|/,
  /\| vNext proposal generation planning plan \| pass \| `docs\/42_proposal-generation-planning-plan\.md`, `node scripts\/vnext-proposal-generation-planning-plan-status\.mjs` \|/,
  /\| vNext proposal generation implementation \| pass \| `docs\/43_proposal-generation-implementation\.md`, `node scripts\/smoke-deterministic-proposal-draft-generation\.mjs`, `node scripts\/vnext-proposal-generation-implementation-status\.mjs` \|/,
  /\| vNext proposal draft human review \| pass \| `docs\/44_proposal-draft-human-review\.md`, `node scripts\/smoke-proposal-draft-human-review\.mjs`, `node scripts\/vnext-proposal-draft-human-review-status\.mjs` \|/,
  /\| vNext proposal draft human review decision packet \| pass \| `docs\/45_proposal-draft-human-review-decision-packet\.md`, `node scripts\/vnext-proposal-draft-human-review-decision-packet-status\.mjs` \|/,
  /\| vNext proposal draft human review evidence decision \| pass \| `docs\/46_proposal-draft-human-review-evidence-decision\.md`, `node scripts\/vnext-proposal-draft-human-review-evidence-decision-status\.mjs` \|/,
  /\| vNext proposal draft downstream authority decision packet \| pass \| `docs\/47_proposal-draft-downstream-authority-decision-packet\.md`, `node scripts\/vnext-proposal-draft-downstream-authority-decision-packet-status\.mjs` \|/,
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
assertReadmeHas(/total `179\/179`/);
assert.match(verificationStatus, /completion-gate-inventory-current-evidence/);
assert.match(verificationStatus, /smoke-completion-gate-inventory-current-evidence\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-650\.mjs/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'smoke-completion-gate-inventory-current-evidence',
      smokeFileCount,
      uiSmokeFileCount,
      aggregate: {
        required: '1/1',
        informational: '178/178',
        total: '179/179',
      },
    },
    null,
    2,
  )}\n`,
);
