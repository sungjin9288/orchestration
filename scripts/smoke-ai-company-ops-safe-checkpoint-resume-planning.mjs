import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-ops-safe-checkpoint-resume-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countScripts(pattern) {
  return fs.readdirSync(path.join(repoRoot, 'scripts')).filter((name) => pattern.test(name)).length;
}

const plan = read('docs/151_ai-company-ops-safe-checkpoint-resume-plan.md');
const handoff = read(
  'docs/152_ai-company-ops-safe-checkpoint-resume-implementation-decision-handoff.md',
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
  /planning authority is recorded as `DEC-222`/,
  /complete implementation handoff is recorded as\s+`DEC-223`/,
  /accepted as `DEC-224`/,
  /local-stub QA WorkOrderAttempt/,
  /schemaVersion = 28/,
  /sequences\.opsAttemptResume/,
  /opsAttemptResumes\{\}/,
  /exact sixteen-key body/,
  /source-worker-stopped-and-read-only-qa-confirmed/,
  /expectedReplacementAttemptNumber=2/,
  /explicit operator-owned fact/,
  /attempt-specific settlement/i,
  /one existing shell-free QA boundary/,
  /Builder, Reviewer, specialist, cancellation, retry, process termination/,
]) {
  assert.match(plan, pattern);
}

assert.match(handoff, /operator-decision-ai-company-ops-safe-checkpoint-resume-implementation-001/);
assert.match(handoff, /schema-v28 safe-checkpoint resume/);
assert.match(handoff, /scripts\/smoke-ui-slice-715\.mjs/);
assert.match(handoff, /source-worker-stop confirmation/);
assert.match(handoff, /accepted as `DEC-224`/);

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
  assert.match(source, /DEC-222/, `${label} must record DEC-222`);
  assert.match(source, /DEC-223/, `${label} must record DEC-223`);
  assert.match(source, /DEC-224/, `${label} must record DEC-224 implementation`);
}

assert.match(decisionLog, /^### DEC-222$/m);
assert.match(decisionLog, /^### DEC-223$/m);
assert.match(decisionLog, /^### DEC-224$/m);
assert.match(contracts, /const STATE_SCHEMA_VERSION = 29/);
assert.match(contracts, /opsAttemptResume/);
assert.match(runtime, /resumeOpsAttemptFromSafeCheckpoint/);
assert.match(server, /attempt-resumes/);
assert.match(server, /resume-safe-checkpoint/);
assert.equal(fs.existsSync(path.join(repoRoot, 'src/runtime/ops-attempt-resumes.js')), true);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ai-company-ops-safe-checkpoint-resume.mjs')),
  true,
);
assert.equal(fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-715.mjs')), true);
assert.match(verification, /ai-company-ops-safe-checkpoint-resume-planning/);
assert.match(verification, /ai-company-ops-safe-checkpoint-resume/);
assert.match(readme, /1012 smoke files/);
assert.match(readme, /716 UI smoke files/);

const smokeFileCount = countScripts(/^smoke-.*\.mjs$/);
const uiSmokeFileCount = countScripts(/^smoke-ui-slice-.*\.mjs$/);
assert.equal(smokeFileCount, 1012);
assert.equal(uiSmokeFileCount, 716);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  planningDecision: 'accepted-dec-222',
  handoffDecision: 'recorded-dec-223',
  implementationDecision: 'accepted-dec-224',
  schemaVersion: 29,
  targetRole: 'qa',
  implementationAllowed: true,
  smokeFileCount,
  uiSmokeFileCount,
}, null, 2)}\n`);
