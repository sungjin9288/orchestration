import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = 'ai-company-durable-rework-delivery-package-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertHasAll(text, patterns) {
  for (const pattern of patterns) assert.match(text, pattern);
}

function countScripts(pattern) {
  return fs
    .readdirSync(path.join(repoRoot, 'scripts'))
    .filter((name) => pattern.test(name)).length;
}

const plan = read('docs/145_ai-company-durable-rework-delivery-package-plan.md');
const handoff = read(
  'docs/146_ai-company-durable-rework-delivery-package-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const inventory = read('docs/22_completion-gate-inventory.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const deliveryRoadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionPlan = read('docs/113_ai-company-multi-agent-completion-plan.md');
const previewPlan = read('docs/143_ai-company-rework-delivery-package-preview-plan.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const runtimeService = read('src/runtime/runtime-service.js');
const previewModule = read('src/runtime/rework-delivery-package-preview.js');

assertHasAll(plan, [
  /^# AI Company Durable Rework DeliveryPackage Persistence Plan$/m,
  /operator-delegated-ai-company-durable-rework-delivery-package-planning-001/,
  /approve-ai-company-durable-rework-delivery-package-planning-only/,
  /Planning-only authority is recorded as `DEC-213`/,
  /`DEC-214` records the\s+complete fielded implementation handoff/,
  /Implementation remains reserved for exact `DEC-215`/,
  /schemaVersion = 25/,
  /sequences\.reworkDeliveryPackage/,
  /^reworkDeliveryPackages\{\}$/m,
  /Add no reverse reference to immutable ReworkPlan/,
  /status=review-required/,
  /allowedActions=\[\]/,
  /record-rework-delivery-package/,
  /record-exact-rework-delivery-package-without-acceptance-or-close-out/,
  /at most 500 UTF-8\s+bytes/,
  /POST \/api\/rework-plans\/:reworkPlanId\/delivery-packages/,
  /exactly these thirteen keys/,
  /^reworkDeliveryEvidenceDigest$/m,
  /^recordApproval$/m,
  /resolve an exact existing record first for idempotent replay/i,
  /GET \/api\/rework-delivery-packages\/:reworkDeliveryPackageId/,
  /GET \/api\/rework-plans\/:reworkPlanId\/delivery-package/,
  /generic `\/api\/snapshot` excludes `reworkDeliveryPackages`/,
  /not a list,\s+history, search, ranking, recommendation, or automatic selection/,
  /scripts\/smoke-ui-slice-712\.mjs/,
]);

for (const field of [
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
]) {
  assert.match(handoff, new RegExp(`^${field}$`, 'm'));
  assert.match(handoff, new RegExp(`^${field}=`, 'm'));
}

assertHasAll(handoff, [
  /^# AI Company Durable Rework DeliveryPackage Implementation Decision Handoff$/m,
  /Planning-only decision: accepted as `DEC-213`/,
  /Implementation handoff: recorded as `DEC-214`/,
  /Complete fielded implementation decision: not yet accepted/,
  /decisionId=operator-decision-ai-company-durable-rework-delivery-package-implementation-001/,
  /decisionStatus=approve-ai-company-durable-rework-delivery-package-implementation-slice/,
  /one deterministic local schema-v25 immutable review-required ReworkDeliveryPackage/,
  /exact current schema-v24 DEC-212 preview request/,
  /atomically migrate valid state and append one immutable ReworkDeliveryPackage/,
  /add schemaVersion 25 plus only sequences\.reworkDeliveryPackage and reworkDeliveryPackages/,
  /scripts\/smoke-ai-company-durable-rework-delivery-package\.mjs/,
  /scripts\/smoke-ui-slice-712\.mjs/,
  /schema-v26 migration/,
  /permits record creation and exact inspection only/,
  /Generic approval, broad continuation, delegated self-approval/,
]);

for (const decisionId of ['DEC-212', 'DEC-213', 'DEC-214']) {
  assert.match(decisionLog, new RegExp(`^### ${decisionId}$`, 'm'));
}
assert.match(
  decisionLog,
  /### DEC-213[\s\S]*Status: `Accepted`[\s\S]*planning-only authority[\s\S]*changes no runtime, schema, API, UI/,
);
assert.match(
  decisionLog,
  /### DEC-214[\s\S]*Status: `Accepted`[\s\S]*No implementation authority is recorded[\s\S]*accepted separately as `DEC-215`/,
);

for (const source of [
  inventory,
  masterPlan,
  runtimeContract,
  councilProtocol,
  deliveryRoadmap,
  completionPlan,
  readme,
]) {
  assert.match(source, /DEC-213/);
  assert.match(source, /DEC-214/);
}

assert.match(
  inventory,
  /AI Company durable Rework DeliveryPackage planning \| pass/,
);
assert.match(
  readme,
  /docs\/145_ai-company-durable-rework-delivery-package-plan\.md/,
);
assert.match(
  readme,
  /docs\/146_ai-company-durable-rework-delivery-package-implementation-decision-handoff\.md/,
);
assert.match(
  taskLedger,
  /ai-company-durable-rework-delivery-package-planning-post-m7-2042/,
);
assert.match(
  lessons,
  /durable rework delivery package[\s\S]*generic DeliveryPackage/i,
);
assert.match(
  verification,
  /id: 'ai-company-durable-rework-delivery-package-planning'/,
);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-durable-rework-delivery-package-planning\.mjs'/,
);

assert.match(contracts, /const STATE_SCHEMA_VERSION = 25/);
assert.match(runtimeService, /function previewReworkDeliveryPackage\(input\)/);
assert.match(previewModule, /status: 'rework-delivery-preview-ready'/);
assert.match(previewModule, /persisted: false/);
assert.equal(
  fs.existsSync(
    path.join(repoRoot, 'src/runtime/rework-delivery-packages.js'),
  ),
  true,
);
assert.equal(
  fs.existsSync(
    path.join(
      repoRoot,
      'scripts/smoke-ai-company-durable-rework-delivery-package.mjs',
    ),
  ),
  true,
);
assert.equal(
  fs.existsSync(path.join(repoRoot, 'scripts/smoke-ui-slice-712.mjs')),
  true,
);

const smokeFileCount = countScripts(/^smoke-.*\.mjs$/);
const uiSmokeFileCount = countScripts(/^smoke-ui-slice-.*\.mjs$/);
assert.equal(smokeFileCount, 999);
assert.equal(uiSmokeFileCount, 712);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode,
  planningDecision: 'accepted-dec-213',
  handoffDecision: 'documented-dec-214',
  implementationDecision: 'accepted-dec-215',
  currentSchemaVersion: 25,
  plannedSchemaVersion: 25,
  runtimeMutation: true,
  durableCreationAllowed: true,
  smokeFileCount,
  uiSmokeFileCount,
}, null, 2)}\n`);
