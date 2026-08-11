import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-reviewed-mission-context-attachment-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countScripts(pattern) {
  return fs.readdirSync(path.join(repoRoot, 'scripts')).filter((name) => pattern.test(name)).length;
}

const plan = read('docs/153_ai-company-reviewed-mission-context-attachment-plan.md');
const handoff = read(
  'docs/154_ai-company-reviewed-mission-context-attachment-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const todo = read('tasks/todo.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const runtime = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');

const fields = [
  'decisionId', 'decisionStatus', 'targetAuthority', 'targetSurface',
  'implementationPlanRefs', 'runtimePath', 'compatibilityPlanRefs',
  'migrationPlanRefs', 'sourceEvidenceRefs', 'negativeEvidenceRefs',
  'rollbackRefs', 'focusedSmokeRefs', 'aggregateVerificationRef',
  'stillBlockedAuthorities', 'approvalStatement',
];

for (const field of fields) {
  assert.equal((handoff.match(new RegExp(`^${field}$`, 'gm')) ?? []).length, 1);
  assert.equal((handoff.match(new RegExp(`^${field}=`, 'gm')) ?? []).length, 1);
}

for (const pattern of [
  /planning authority is recorded as `DEC-225`/,
  /complete implementation handoff is recorded as\s+`DEC-226`/,
  /Exact `DEC-227` consumes this plan/,
  /Stage 7A: reviewed Mission context attachment record/,
  /Stage 7B: one explicit role-owned context consumption request/,
  /schemaVersion = 29/,
  /sequences\.missionContextAttachment/,
  /missionContextAttachments\{\}/,
  /exact ten-key JSON body/,
  /reviewed-exact-memory-context-for-immutable-mission-attachment/,
  /at most one attachment per target Mission/,
  /GET \/api\/missions\/:missionId\/context-attachment/,
  /context consumption or injection/,
]) {
  assert.match(plan, pattern);
}

assert.match(
  handoff,
  /operator-decision-ai-company-reviewed-mission-context-attachment-implementation-001/,
);
assert.match(handoff, /schema-v29 immutable MissionContextAttachment/);
assert.match(handoff, /scripts\/smoke-ui-slice-716\.mjs/);
assert.match(handoff, /accepted as `DEC-227`/);
assert.match(handoff, /record and exact inspection only/);

for (const [source, label] of [
  [decisionLog, 'decision log'],
  [masterPlan, 'master plan'],
  [runtimeContract, 'runtime contract'],
  [councilProtocol, 'council protocol'],
  [deliveryRoadmap, 'delivery roadmap'],
  [completionPlan, 'completion plan'],
  [inventory, 'completion inventory'],
  [readme, 'README'],
  [todo, 'task ledger'],
]) {
  assert.match(source, /DEC-225/, `${label} must record DEC-225`);
  assert.match(source, /DEC-226/, `${label} must record DEC-226`);
  assert.match(source, /DEC-227/, `${label} must record DEC-227 implementation`);
}

assert.match(decisionLog, /^### DEC-225$/m);
assert.match(decisionLog, /^### DEC-226$/m);
assert.match(decisionLog, /^### DEC-227$/m);
assert.match(contracts, /const STATE_SCHEMA_VERSION = 30/);
assert.match(contracts, /missionContextAttachment/);
assert.match(runtime, /attachReviewedMissionContext/);
assert.match(server, /context-attachments/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/runtime/mission-context-attachments.js')),
  true,
);
assert.equal(
  fs.existsSync(
    path.join(repoRoot, 'scripts/smoke-ai-company-reviewed-mission-context-attachment.mjs'),
  ),
  true,
);
assert.equal(fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-716.mjs')), true);
assert.match(verification, /ai-company-reviewed-mission-context-attachment-planning/);
assert.match(verification, /ai-company-reviewed-mission-context-attachment-implementation/);
assert.match(readme, /1014 smoke files/);
assert.match(readme, /717 UI smoke files/);

const smokeFileCount = countScripts(/^smoke-.*\.mjs$/);
const uiSmokeFileCount = countScripts(/^smoke-ui-slice-.*\.mjs$/);
assert.equal(smokeFileCount, 1014);
assert.equal(uiSmokeFileCount, 717);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  planningDecision: 'accepted-dec-225',
  handoffDecision: 'recorded-dec-226',
  implementationDecision: 'accepted-dec-227',
  currentSchemaVersion: 29,
  plannedSchemaVersion: 29,
  implementationAllowed: true,
  roleConsumptionAllowed: false,
  smokeFileCount,
  uiSmokeFileCount,
}, null, 2)}\n`);
