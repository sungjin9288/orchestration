import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-rework-delivery-package-acceptance-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

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

const plan = read('docs/147_ai-company-rework-delivery-package-acceptance-plan.md');
const handoff = read(
  'docs/148_ai-company-rework-delivery-package-acceptance-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const roadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const todo = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');

assert.match(plan, /^# AI Company ReworkDeliveryPackage Acceptance Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Planned State Schema v26',
  'ReworkDeliveryPackageAcceptance Contract',
  'Exact Request And Digest Binding',
  'Exact Inspection',
  'UI Boundary',
  'Compatibility And Rollback',
  'Focused Verification Plan',
  'Implementation Target Surface',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Planning Status',
  'Verification',
]);

const planText = compact(plan);
const handoffText = compact(handoff);
for (const pattern of [
  /operator-delegated-ai-company-rework-delivery-package-acceptance-planning-001/,
  /approve-ai-company-rework-delivery-package-acceptance-planning-only/,
  /schema-v26 append-only ReworkDeliveryPackageAcceptance/,
  /fresh complete DEC-212 recomputation/,
  /replay validates the existing acceptance and immutable package before mutable source recomputation/,
  /POST \/api\/rework-delivery-packages\/:reworkDeliveryPackageId\/accept/,
  /GET \/api\/rework-delivery-packages\/:reworkDeliveryPackageId\/acceptance/,
  /implementation was accepted and completed by exact value-matching `DEC-218`/i,
]) {
  assert.match(planText, pattern);
}

assert.match(
  handoff,
  /^# AI Company ReworkDeliveryPackage Acceptance Implementation Decision Handoff$/m,
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
for (const pattern of [
  /operator-decision-ai-company-rework-delivery-package-acceptance-implementation-001/,
  /approve-ai-company-rework-delivery-package-acceptance-implementation-slice/,
  /targetAuthority=one deterministic local schema-v26 append-only ReworkDeliveryPackageAcceptance/,
  /replay before mutable source recomputation/,
  /stillBlockedAuthorities=ReworkDeliveryPackage rejection changes-requested/,
  /accepted as `DEC-218` and this handoff is consumed/,
]) {
  assert.match(handoffText, pattern);
}

assert.match(decisionLog, /^### DEC-216$/m);
assert.match(decisionLog, /^### DEC-217$/m);
assert.match(decisionLog, /^### DEC-218$/m);
for (const source of [masterPlan, runtimeContract, councilProtocol, roadmap, completionPlan]) {
  assert.match(source, /DEC-216/);
  assert.match(source, /DEC-217/);
  assert.match(source, /DEC-218/);
}
assert.match(inventory, /AI Company ReworkDeliveryPackage acceptance planning \| pass/);
assert.match(readme, /docs\/147_ai-company-rework-delivery-package-acceptance-plan\.md/);
assert.match(
  readme,
  /docs\/148_ai-company-rework-delivery-package-acceptance-implementation-decision-handoff\.md/,
);
assert.match(todo, /ai-company-rework-delivery-package-acceptance-planning-post-m7-2044/);
assert.match(
  lessons,
  /Rework package acceptance must be an append-only fact and not a package status rewrite/,
);
assert.match(
  verification,
  /id: 'ai-company-rework-delivery-package-acceptance-planning'/,
);
assert.match(contracts, /const STATE_SCHEMA_VERSION = 27/);
assert.match(
  contracts,
  /const REWORK_DELIVERY_PACKAGE_ACCEPTANCE_STATE_SCHEMA_VERSION = 26/,
);
assert.equal(
  fs.existsSync(
    path.join(repoRoot, 'src/runtime/rework-delivery-package-acceptances.js'),
  ),
  true,
);
assert.equal(
  fs.existsSync(
    path.join(repoRoot, 'scripts/smoke-ai-company-rework-delivery-package-acceptance.mjs'),
  ),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-713.mjs')),
  true,
);

const smokeFileCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-.*\.mjs$/.test(name)).length;
const uiSmokeFileCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-ui-slice-.*\.mjs$/.test(name)).length;
assert.equal(smokeFileCount, 1005);
assert.equal(uiSmokeFileCount, 714);
assert.match(readme, /1005 smoke files/);
assert.match(readme, /714 UI smoke files/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  planningDecision: 'accepted-dec-216',
  handoffDecision: 'documented-dec-217',
  implementationDecision: 'accepted-dec-218',
  currentSchemaVersion: 26,
  plannedSchemaVersion: 26,
  sourcePackageImmutable: true,
  firstWriteFreshRecompute: true,
  replayBeforeSourceRecompute: true,
  smokeFileCount,
  uiSmokeFileCount,
}, null, 2)}\n`);
