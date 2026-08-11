import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-strategist-mission-context-consumption-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countScripts(pattern) {
  return fs.readdirSync(path.join(repoRoot, 'scripts')).filter((name) => pattern.test(name)).length;
}

const plan = read('docs/155_ai-company-strategist-mission-context-consumption-plan.md');
const handoff = read(
  'docs/156_ai-company-strategist-mission-context-consumption-implementation-decision-handoff.md',
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
const completionSmoke = read('scripts/smoke-completion-gate-inventory-current-evidence.mjs');
const contracts = read('src/runtime/contracts.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const fileStore = read('src/runtime/file-store.js');

const packetLines = [
  'decisionId=operator-decision-ai-company-strategist-mission-context-consumption-implementation-001',
  'decisionStatus=approve-ai-company-strategist-mission-context-consumption-implementation-slice',
  'targetAuthority=one explicit operator-selected exact-id source-current MissionContextAttachment created under schema-v29 state and consumed by Strategist only during the first attempt of one new schema-v30 real-local-stub StaffingPlan Council start path and stopped at human alignment',
  'targetSurface=src/runtime/contracts.js, src/runtime/mission-context-attachments.js, src/runtime/strategist-context-consumption.js, src/runtime/staffing-entries.js, src/runtime/council-sessions.js, src/execution/council-coordinator.js, src/execution/providers/council-local-stub-adapter.js, src/runtime/runtime-service.js, src/runtime/file-store.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-strategist-mission-context-consumption.mjs, scripts/smoke-ui-slice-717.mjs, scripts/smoke-state-transaction-guard.mjs, scripts/smoke-*.mjs current-schema assertion updates, scripts/verification_status.mjs, scripts/ui_qa_status.mjs',
  'implementationPlanRefs=docs/155_ai-company-strategist-mission-context-consumption-plan.md',
  'runtimePath=require one exact accepted current local-stub StaffingPlan and one exact current unexpired MissionContextAttachment created under schema-v29 state plus separate contextConsumption decision, load supported state through structural and immutable-lineage validation, return exact retained replay before mutable recomputation, otherwise validate the complete current source tuple, pass one frozen normalized context only to Strategist, run one observable deterministic real-local-stub Council first attempt in memory, persist one context-bound StaffingEntry CouncilSession Strategist position and only the existing Mission staffingEntryId councilSessionId status and updatedAt alignment transition in one atomic schema-v30 save, and stop at human alignment',
  'compatibilityPlanRefs=preserve every schema-v29 record in its original exact shape and digest as a legacy variant without backfill, preserve the contextless StaffingEntry and Council path, provider and legacy Council behavior, Mission content identity fields and unrelated lifecycle behavior, Architect and Decomposer requests without a context key, Conductor input as an allowlisted position projection without attachment identifiers context digests or consumption receipts, raw normalized context and bounded receipts outside generic snapshots, exact-inspection-only receipt hydration, and supported schema-v29 on-disk inspection without migration writes',
  'migrationPlanRefs=add STATE_SCHEMA_VERSION 30 and STRATEGIST_CONTEXT_CONSUMPTION_STATE_SCHEMA_VERSION 30 only, add no top-level sequence map reverse reference placeholder or context bootstrap, preserve every valid schema-v29 value byte-equivalent, use the existing additive file-store rule so boot read GET preview invalid input and exact replay never save while the next successful authorized write may persist normalized v30 without fabricated context fields, require legacy-shaped contextless or exact context-bound v30 record variants, validate post-transition attachment history through attachment targetMissionDigest equals StaffingPlan missionDigest equals StaffingEntry missionDigest plus Mission StaffingEntry CouncilSession project lineage, reject partial mixed stale future or digest-invalid state, and retain valid schema-v30 evidence during rollback without downgrade deletion rewrite or implicit reuse',
  'sourceEvidenceRefs=DEC-130, DEC-169, DEC-225, DEC-226, DEC-227, DEC-228, DEC-229, docs/54_ai-company-real-council-implementation-plan.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/115_ai-company-staffing-entry-binding-plan.md, docs/153_ai-company-reviewed-mission-context-attachment-plan.md, docs/154_ai-company-reviewed-mission-context-attachment-implementation-decision-handoff.md, docs/155_ai-company-strategist-mission-context-consumption-plan.md, src/runtime/mission-context-attachments.js, src/runtime/staffing-entries.js, src/runtime/council-sessions.js, src/execution/council-coordinator.js, src/execution/providers/council-local-stub-adapter.js, src/runtime/runtime-service.js',
  'negativeEvidenceRefs=current schema-v29 runtime records and inspects MissionContextAttachment only, roleConsumptionStatus remains blocked, the existing local Council start requires StaffingEntry but accepts no attachment id or digest, coordinator sends no role-specific context, local-stub Strategist consumes agenda only, immutable StaffingEntry CouncilSession and CouncilPosition records have no context selection receipt or consumption ref, file-store draft-only attachment recomputation cannot validate the normal aligning transition, current normalization persists the latest schema on any later successful write, existing smoke-suite current-schema assertions require bounded maintenance, generic snapshots expose CouncilSession records, Conductor currently receives full position objects, and no context-bound downstream scheduler guard exists',
  'rollbackRefs=disable the new POST route and UI opt-in, reject new context-bound starts and direct context calls, preserve existing schema-v30 context-bound StaffingEntry CouncilSession Strategist position and attachment evidence as exact inspect-only records, keep the existing contextless Council entry available, keep generic snapshots redacted, block every downstream use of retained context-bound sessions, perform no downgrade deletion source rewrite or implicit retry, and rerun focused compatibility transaction UI and aggregate verification',
  'focusedSmokeRefs=scripts/smoke-ai-company-strategist-mission-context-consumption-planning.mjs; scripts/smoke-ai-company-strategist-mission-context-consumption.mjs; scripts/smoke-ui-slice-717.mjs; scripts/smoke-ai-company-reviewed-mission-context-attachment.mjs; scripts/smoke-ai-company-staffing-entry-binding.mjs; scripts/smoke-ai-company-real-council.mjs; scripts/smoke-state-transaction-guard.mjs',
  'aggregateVerificationRef=node scripts/verification_status.mjs',
  'stillBlockedAuthorities=Architect or Decomposer context consumption, Conductor raw context, planner consumption, prompt or policy injection, ExecutionPlan or WorkOrder injection, provider context or provider generation, automatic attachment MemoryRecall MemoryItem or Mission retrieval enumeration list search ranking scoring recommendation or selection, source mutation, runtime-agent commit push or release, retry rework revision resume parallel dynamic autonomous background or scheduled execution, profile or policy mutation, approval bypass, collections, and external connectors',
  'approvalStatement=I approve implementation only for one exact MissionContextAttachment created under schema-v29 state and consumed by Strategist through the schema-v30 first-attempt real-local-stub StaffingPlan Council entry described in docs/155_ai-company-strategist-mission-context-consumption-plan.md, including the bounded current-schema assertion maintenance required by the additive migration. This does not approve Architect or Decomposer consumption, Conductor raw context or consumption receipts, planner prompt policy ExecutionPlan or WorkOrder injection, provider use, automatic retrieval search ranking recommendation, source Git release scheduling bypass collections or connectors.',
];

const handoffLines = handoff.split('\n');
const fields = packetLines.map((line) => line.slice(0, line.indexOf('=')));
const requiredFieldLines = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'implementationPlanRefs',
  'runtimePath',
  'compatibilityPlanRefs',
  'migrationPlanRefs',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];
for (const field of fields) {
  assert.equal(handoffLines.filter((line) => line === field).length, 1);
  assert.equal(handoffLines.filter((line) => line.startsWith(`${field}=`)).length, 1);
}
assert.deepEqual(requiredFieldLines, fields);
for (const line of packetLines) {
  assert.equal(handoffLines.filter((candidate) => candidate === line).length, 1);
}

for (const pattern of [
  /^# AI Company Strategist Mission Context Consumption Plan$/m,
  /DEC-228/,
  /DEC-229/,
  /DEC-230/,
  /implementationAllowed=true/,
  /schema-v30/,
  /accepted StaffingPlan -> StaffingEntry -> CouncilSession/,
  /POST \/api\/staffing-plans\/:staffingPlanId\/council-entry-with-strategist-context/,
  /staffingPlanRecordDigest[\s\S]*contextConsumption/,
  /decision=consume/,
  /targetRole=strategist/,
  /requestedAt/,
  /attachedAt <= requestedAt < expiresAt/,
  /exact replay[\s\S]*zero adapter[\s\S]*calls[\s\S]*zero state saves/i,
  /Only the Strategist request receives the normalized context object/,
  /Architect and[\s\S]*Decomposer requests have no context key/,
  /Conductor receives an explicit[\s\S]*allowlisted position projection/,
  /observably acknowledge reviewed-context use/,
  /existing additive v29-to-v30 migration/,
  /attachment\.targetMissionDigest === staffingPlan\.missionDigest/,
  /exact-inspection-only receipt hydration/,
  /no top-level sequence, map, reverse reference, or placeholder/i,
  /roleConsumptionStatus=blocked/,
  /human alignment/,
  /rollback/i,
  /Context-bound sessions must fail closed/,
]) {
  assert.match(plan, pattern);
}

assert.match(handoff, /^# AI Company Strategist Mission Context Consumption Implementation Decision Handoff$/m);
assert.match(handoff, /DEC-229/);
assert.match(handoff, /DEC-230/);
assert.match(handoff, /schema-v30/);
assert.match(handoff, /no top-level sequence map reverse reference placeholder or context bootstrap/);
assert.match(handoff, /Architect or Decomposer context consumption/);
assert.match(handoff, /next successful authorized write may persist normalized v30/);
assert.match(handoff, /allowlisted position projection without attachment identifiers/);
assert.match(handoff, /exact-inspection-only receipt hydration/);

assert.match(decisionLog, /^### DEC-228$/m);
assert.match(decisionLog, /^### DEC-229$/m);
assert.match(decisionLog, /^### DEC-230$/m);
for (const [source, label] of [
  [masterPlan, 'master plan'],
  [runtimeContract, 'runtime contract'],
  [councilProtocol, 'council protocol'],
  [deliveryRoadmap, 'delivery roadmap'],
  [completionPlan, 'completion plan'],
  [inventory, 'completion inventory'],
  [readme, 'README'],
  [todo, 'task ledger'],
]) {
  assert.match(source, /DEC-228/, `${label} must record DEC-228`);
  assert.match(source, /DEC-229/, `${label} must record DEC-229`);
  assert.match(source, /DEC-230/, `${label} must record DEC-230`);
}

assert.match(contracts, /const STATE_SCHEMA_VERSION = 30/);
assert.match(contracts, /const STRATEGIST_CONTEXT_CONSUMPTION_STATE_SCHEMA_VERSION = 30/);
assert.match(fileStore, /MISSION_CONTEXT_ATTACHMENT_STATE_SCHEMA_VERSION/);
assert.match(runtimeService, /enterStaffingPlanCouncilWithStrategistContext/);
assert.match(server, /council-entry-with-strategist-context/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/runtime/strategist-context-consumption.js')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-strategist-mission-context-consumption.mjs')),
  true,
);
assert.equal(fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-717.mjs')), true);

assert.match(verification, /id: 'ai-company-strategist-mission-context-consumption-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-strategist-mission-context-consumption-planning\.mjs'/,
);
assert.match(verification, /id: 'ai-company-strategist-mission-context-consumption-implementation'/);
assert.match(verification, /id: 'ai-company-strategist-mission-context-consumption-ui-api'/);
assert.match(readme, /1014 smoke files/);
assert.match(readme, /717 UI smoke files/);
assert.match(inventory, /informational `315\/315`/);
assert.match(inventory, /total `316\/316`/);
assert.match(completionSmoke, /informational: '315\/315'/);
assert.match(completionSmoke, /total: '316\/316'/);

const smokeFileCount = countScripts(/^smoke-.*\.mjs$/);
const uiSmokeFileCount = countScripts(/^smoke-ui-slice-.*\.mjs$/);
assert.equal(smokeFileCount, 1014);
assert.equal(uiSmokeFileCount, 717);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      planningDecision: 'accepted-dec-228',
      handoffDecision: 'accepted-dec-229',
      implementationDecision: 'accepted-dec-230',
      currentSchemaVersion: 30,
      plannedSchemaVersion: 30,
      route: '/api/staffing-plans/:staffingPlanId/council-entry-with-strategist-context',
      entryPath: 'accepted StaffingPlan -> StaffingEntry -> CouncilSession',
      contextTargetRole: 'strategist-only-first-attempt',
      stopAt: 'human-alignment',
      implementationAllowed: true,
      topLevelConsumptionMapAllowed: false,
      architectContextAllowed: false,
      decomposerContextAllowed: false,
      conductorRawContextAllowed: false,
      providerAllowed: false,
      downstreamSchedulerAllowed: false,
      smokeFileCount,
      uiSmokeFileCount,
    },
    null,
    2,
  )}\n`,
);
