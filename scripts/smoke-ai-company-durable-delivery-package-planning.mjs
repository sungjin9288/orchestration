import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-durable-delivery-package-planning-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

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

function assertAll(source, patterns) {
  for (const pattern of patterns) assert.match(source, pattern);
}

const plan = read('docs/66_ai-company-durable-delivery-package-persistence-plan.md');
const handoff = read(
  'docs/67_ai-company-durable-delivery-package-implementation-decision-handoff.md',
);
const decisionLog = read('docs/01_decision-log.md');
const masterPlan = read('docs/48_ai-company-master-plan.md');
const runtimeContract = read('docs/49_agent-runtime-contract.md');
const councilProtocol = read('docs/50_council-operating-protocol.md');
const roadmap = read('docs/51_ai-company-delivery-roadmap.md');
const completionInventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const taskLedger = read('tasks/todo.md');
const lessons = read('tasks/lessons.md');
const verification = read('scripts/verification_status.mjs');
const contracts = read('src/runtime/contracts.js');
const fileStore = read('src/runtime/file-store.js');
const runtimeService = read('src/runtime/runtime-service.js');
const server = read('scripts/serve-ui-slice-01.mjs');
const ui = read('ui/app.js');

const planText = compact(plan);
const handoffText = compact(handoff);
const readmeText = compact(readme);
const roadmapText = compact(roadmap);

assert.match(plan, /^# AI Company Durable DeliveryPackage Persistence Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Planned State Schema v9',
  'Durable DeliveryPackage Contract',
  'Digest And Idempotency Binding',
  'Runtime And API Plan',
  'UI Boundary',
  'Compatibility And Migration',
  'Focused Verification Plan',
  'Rollback Plan',
  'Implementation Target Surface',
  'Implementation Sequence',
  'Acceptance Criteria',
  'Exclusions',
  'Planning Status',
  'Verification',
]);
assertAll(planText, [
  /operator-delegated-ai-company-durable-delivery-package-planning-001/,
  /approve-ai-company-durable-delivery-package-planning-only/,
  /planning only for one deterministic local schema-v9 durable DeliveryPackage `review-required` record/,
  /previewId.*sourceDigest.*packageDigest.*checkpointId.*checkpointDigest/,
  /Migration itself creates no DeliveryPackage/,
  /status = review-required/,
  /GET \/api\/execution-plans\/:executionPlanId\/delivery-package/,
  /POST \/api\/execution-plans\/:executionPlanId\/persist-delivery-package/,
  /Package acceptance, Mission done, commit, push, release, learning/,
  /Schema\/runtime\/API\/UI implementation: blocked pending one complete fielded decision/,
]);

assert.match(
  handoff,
  /^# AI Company Durable DeliveryPackage Implementation Decision Handoff$/m,
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
assertAll(handoffText, [
  /operator-decision-ai-company-durable-delivery-package-implementation-001/,
  /approve-ai-company-durable-delivery-package-implementation-slice/,
  /one deterministic local schema-v9 durable DeliveryPackage review-required record/,
  /create no package during migration/,
  /stillBlockedAuthorities=DeliveryPackage acceptance rejection changes-requested/,
  /approval approved continue do everything approve all self approve use your judgment/,
  /Complete fielded implementation decision: not supplied/,
]);

assert.match(decisionLog, /^### DEC-098$/m);
assert.match(decisionLog, /^### DEC-099$/m);
assert.match(masterPlan, /Durable DeliveryPackage persistence planning은 `DEC-098`/);
assert.match(runtimeContract, /Durable DeliveryPackage persistence planning은 `DEC-098`/);
assert.match(councilProtocol, /Durable DeliveryPackage persistence planning은 `DEC-098`/);
assertAll(roadmapText, [
  /Durable DeliveryPackage persistence planning은 `DEC-098`/,
  /implementation handoff는 `DEC-099`/,
  /Current runtime remains schema v8 and creates no durable package/,
]);
assert.match(
  completionInventory,
  /AI Company durable DeliveryPackage persistence planning \| pass/,
);
assertAll(readmeText, [
  /Durable DeliveryPackage persistence planning is accepted by `DEC-098`/,
  /complete fielded implementation handoff is recorded by `DEC-099`/,
  /runtime remains schema v8/,
  /preview remains `persisted=false` and `missionDone=false`/,
]);
assert.match(taskLedger, /ai-company-durable-delivery-package-planning-post-m7-1952/);
assert.match(
  lessons,
  /Promoting a response-only delivery object into durable state must not smuggle in package acceptance or Mission completion/,
);
assert.match(verification, /id: 'ai-company-durable-delivery-package-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-durable-delivery-package-planning\.mjs'/,
);

// Pin the current negative evidence so planning cannot be mistaken for implementation.
assert.match(contracts, /const STATE_SCHEMA_VERSION = 8/);
assert.doesNotMatch(contracts, /deliveryPackage/);
assert.doesNotMatch(fileStore, /deliveryPackages/);
assert.match(runtimeService, /function previewExecutionPlanDelivery\(input\)/);
assert.match(runtimeService, /persisted: false/);
assert.match(runtimeService, /missionDone: false/);
assert.doesNotMatch(runtimeService, /function persistExecutionPlanDeliveryPackage\(/);
assert.doesNotMatch(server, /persist-delivery-package/);
assert.doesNotMatch(ui, /data-action="persist-delivery-package"/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-098',
        handoff: 'documented-dec-099',
        implementation: 'blocked-complete-fielded-decision-required',
      },
      plannedPath: {
        schemaVersion: 9,
        recordStatus: 'review-required',
        exactDigestTuple: [
          'previewId',
          'sourceDigest',
          'packageDigest',
          'checkpointId',
          'checkpointDigest',
        ],
        explicitOperatorRequestRequired: true,
      },
      currentRuntime: {
        schemaVersion: 8,
        responseOnlyPreview: true,
        durableDeliveryPackageRecords: false,
        persistenceRoutes: false,
        missionDone: false,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: false,
        schemaMigrationAllowed: false,
        durableRecordAllowed: false,
        packageAcceptanceAllowed: false,
        missionDoneAllowed: false,
        learningAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
        releaseAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
