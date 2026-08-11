import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-ops-attempt-quarantine-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertIncludesAll(text, patterns) {
  for (const pattern of patterns) assert.match(text, pattern);
}

const plan = read('docs/149_ai-company-ops-attempt-quarantine-plan.md');
const handoff = read(
  'docs/150_ai-company-ops-attempt-quarantine-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');

assertIncludesAll(plan, [
  /^# AI Company Ops Attempt Quarantine Plan$/m,
  /planning-only/i,
  /recorded as `DEC-219`/,
  /recorded as `DEC-220`/,
  /reserved for an exact `DEC-221`/,
  /schemaVersion = 27/,
  /sequences\.opsAttemptDisposition/,
  /opsAttemptDispositions\{\}/,
  /OpsAttemptDisposition\(decision=quarantine\)/,
  /operator-uncertain-outcome-after-interruption/,
  /quarantine-without-settlement-or-recovery/,
  /POST \/api\/ops\/attempt-dispositions\/quarantine/,
  /GET \/api\/ops\/attempt-dispositions\/:opsAttemptDispositionId/,
  /exact eleven-key request/i,
  /late-settlement/i,
  /source attempt and parent remain immutable/i,
  /WorkOrderAttempt/,
  /Specialist first-attempt/,
  /Specialist retry-attempt/,
  /No process kill is claimed/,
  /No list, history, search, ranking, polling, automatic target selection/,
  /scripts\/smoke-ui-slice-714\.mjs/,
  /Exact `DEC-221` consumes the handoff/,
]);

const requiredFields = [
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

for (const field of requiredFields) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}

assertIncludesAll(handoff, [
  /^# AI Company Ops Attempt Quarantine Implementation Decision Handoff$/m,
  /Planning-only decision: accepted as `DEC-219`/,
  /Implementation handoff: recorded as `DEC-220`/,
  /Implementation decision: accepted and implemented as `DEC-221`/,
  /decisionId=operator-decision-ai-company-ops-attempt-quarantine-implementation-001/,
  /decisionStatus=approve-ai-company-ops-attempt-quarantine-implementation-slice/,
  /schema-v27 append-only OpsAttemptDisposition/,
  /deny every later settlement for the exact target record digest/,
  /does not approve attempt or parent mutation inferred result cancel worker termination resume replay retry rework new attempts/,
]);

for (const decisionId of ['DEC-218', 'DEC-219', 'DEC-220', 'DEC-221']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}

for (const source of [
  completionPlan,
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  inventory,
  readme,
]) {
  assert.match(source, /DEC-219/);
  assert.match(source, /DEC-220/);
  assert.match(source, /DEC-221/);
}

assert.match(contracts, /const STATE_SCHEMA_VERSION = 30/);
assert.match(contracts, /opsAttemptDisposition/);
assert.match(runtimeService, /createOpsAttemptDisposition/);
assert.match(server, /attempt-dispositions\/quarantine/);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'src/runtime/ops-attempt-dispositions.js')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-ops-attempt-quarantine.mjs')),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-714.mjs')),
  true,
);

assert.match(
  verification,
  /id: 'ai-company-ops-attempt-quarantine-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-ops-attempt-quarantine-planning\.mjs'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-ops-attempt-quarantine\.mjs'/,
);
assert.match(
  taskLedger,
  /ai-company-ops-attempt-quarantine-planning-post-m7-2047/,
);

const smokeFileCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-.*\.mjs$/.test(name)).length;
const uiSmokeFileCount = fs
  .readdirSync(path.join(repoRoot, 'scripts'))
  .filter((name) => /^smoke-ui-slice-.*\.mjs$/.test(name)).length;

assert.equal(smokeFileCount, 1014);
assert.equal(uiSmokeFileCount, 717);
assert.match(readme, /1014 smoke files/);
assert.match(readme, /717 UI smoke files/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode,
      currentSchemaVersion: 27,
      plannedSchemaVersion: 27,
      planningDecision: 'accepted-dec-219',
      handoffDecision: 'recorded-dec-220',
      implementationDecision: 'accepted-dec-221',
      command: 'quarantine',
      sourceMutationAllowed: false,
      inferredSettlementAllowed: false,
      runtimeImplementationAllowed: true,
    },
    null,
    2,
  )}\n`,
);
