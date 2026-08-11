import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-builder-rework-source-mutation-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countFiles(pattern) {
  return fs.readdirSync(path.join(repoRoot, 'scripts'))
    .filter((name) => pattern.test(name)).length;
}

const plan = read('docs/137_ai-company-builder-rework-source-mutation-plan.md');
const handoff = read(
  'docs/138_ai-company-builder-rework-source-mutation-implementation-decision-handoff.md',
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
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const attempts = read('src/runtime/work-order-attempts.js');
const approvalRuntime = read('src/runtime/builder-rework-mutation-approvals.js');
const sourceMutationRuntime = read('src/runtime/builder-rework-source-mutations.js');
const coordinator = read('src/execution/execution-coordinator.js');
const requestBuilders = read('src/execution/coordinator/execution-requests.js');
const localStub = read('src/execution/providers/local-stub-adapter.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const app = read('ui/app.js');

const fields = [
  'decisionId', 'decisionStatus', 'targetAuthority', 'targetSurface',
  'implementationPlanRefs', 'runtimePath', 'compatibilityPlanRefs',
  'migrationPlanRefs', 'sourceEvidenceRefs', 'negativeEvidenceRefs',
  'rollbackRefs', 'focusedSmokeRefs', 'aggregateVerificationRef',
  'stillBlockedAuthorities', 'approvalStatement',
];

for (const field of fields) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}

for (const pattern of [
  /planning-only `DEC-201`/,
  /`DEC-202` records/,
  /exact `DEC-203` consumes that handoff/,
  /changes no runtime, API, UI, schema, state, file, provider/,
  /reuse the existing Builder `WorkOrderAttempt` #3/,
  /must not append WorkOrderAttempt #4/,
  /Approval remains the immutable authorization fact/,
  /generic mutation path is not an authority-compatible implementation/,
  /POST \/api\/rework-plans\/:reworkPlanId\/builder-rework-source-mutation/,
  /GET \/api\/rework-plans\/:reworkPlanId\/builder-rework-source-mutation/,
  /run-builder-rework-live-mutation/,
  /mutate-only-approved-rework-targets-and-stop-before-reviewer/,
  /scope=builder-rework/,
  /allowedNextAction=builder-rework-live-mutation/,
  /project-contained existing regular file/,
  /provider mode is exactly `local-stub`/,
  /waiting-gate` to `active`/,
  /executionMode=rework-live-mutation/,
  /built from the immutable source records, not parsed from Artifact\s+markdown/,
  /change-summary`, `patch`, and `diff` Artifacts/,
  /separate-reviewer-reexecution-decision-required/,
  /Rollback restores only mutation-owned files whose post-write digest is still/,
  /external drift keeps active evidence instead of being overwritten/,
  /no automatic retry/,
  /process stops after the start save/,
  /exact active,\s+failed, or completed lifecycle evidence for an identical replay/,
  /exact request replay after completed settlement/,
  /schemaVersion 24/,
  /Do not silently undo a completed source change/,
  /scripts\/smoke-ui-slice-708\.mjs/,
  /Exact implementation authority: accepted as `DEC-203`/,
]) {
  assert.match(plan, pattern);
}

assert.match(
  handoff,
  /operator-decision-ai-company-builder-rework-source-mutation-implementation-001/,
);
assert.match(
  handoff,
  /no schema migration sequence map or new durable domain record is authorized/,
);
assert.match(handoff, /src\/runtime\/builder-rework-source-mutations\.js/);
assert.match(handoff, /executionMode=rework-live-mutation/);
assert.match(handoff, /before Reviewer or QA re-execution/);
assert.match(decisionLog, /^### DEC-201$/m);
assert.match(decisionLog, /^### DEC-202$/m);
assert.match(decisionLog, /^### DEC-203$/m);

for (const text of [
  masterPlan, runtimeContract, councilProtocol, deliveryRoadmap, completionPlan,
]) {
  assert.match(text, /DEC-201/);
  assert.match(text, /DEC-202/);
  assert.match(text, /DEC-203/);
}

assert.match(inventory, /AI Company Builder rework source mutation planning/);
assert.match(inventory, /AI Company Builder rework source mutation implementation/);
assert.match(
  inventory,
  /required `1\/1` and informational `313\/313` pass; total passed is `314\/314`/,
);
assert.match(readme, /docs\/137_ai-company-builder-rework-source-mutation-plan\.md/);
assert.match(
  readme,
  /docs\/138_ai-company-builder-rework-source-mutation-implementation-decision-handoff\.md/,
);
assert.match(readme, /1012 smoke files/);
assert.match(readme, /716 UI smoke files/);
assert.match(todo, /ai-company-builder-rework-source-mutation-implementation-post-m7-2035/);
assert.match(
  lessons,
  /Mutation authorization evidence and mutation execution evidence need separate owners/,
);
assert.match(verification, /ai-company-builder-rework-source-mutation-planning/);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 29/);
assert.match(contracts, /REWORK_LIVE_MUTATION: 'builder-rework-live-mutation'/);
assert.match(attempts, /START_BUILDER_REWORK_PREFLIGHT: 'start-builder-rework-preflight'/);
assert.match(approvalRuntime, /const ACTION = 'builder-rework-live-mutation'/);
assert.match(coordinator, /async function runBuilderLiveMutation\(input\)/);
assert.match(coordinator, /async function runBuilderReworkPreflight\(input\)/);
assert.match(coordinator, /async function runBuilderReworkSourceMutation\(input\)/);
assert.match(requestBuilders, /executionMode: 'rework-preflight'/);
assert.match(requestBuilders, /executionMode: 'rework-live-mutation'/);
assert.match(localStub, /request\.executionMode === 'rework-preflight'/);
assert.match(localStub, /request\.executionMode === 'rework-live-mutation'/);
assert.match(sourceMutationRuntime, /run-builder-rework-live-mutation/);
assert.match(sourceMutationRuntime, /mutate-only-approved-rework-targets-and-stop-before-reviewer/);
assert.equal(
  server.includes(
    '/^\\/api\\/rework-plans\\/([^/]+)\\/builder-rework-source-mutation$/',
  ),
  true,
);
assert.match(app, /run-builder-rework-source-mutation/);

assert.equal(countFiles(/^smoke-.*\.mjs$/), 1012);
assert.equal(countFiles(/^smoke-ui-slice-.*\.mjs$/), 716);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  planningDecision: 'accepted-dec-201',
  handoffDecision: 'accepted-dec-202',
  implementationDecision: 'accepted-dec-203',
  schemaVersion: 24,
  sourceMutationAllowed: true,
  reviewerQaExecutionAllowed: false,
  smokeFileCount: 1012,
  uiSmokeFileCount: 716,
}, null, 2)}\n`);
