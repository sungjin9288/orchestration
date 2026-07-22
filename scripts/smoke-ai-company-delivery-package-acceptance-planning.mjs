import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-delivery-package-acceptance-planning-smoke';

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

const plan = read('docs/68_ai-company-delivery-package-acceptance-plan.md');
const handoff = read(
  'docs/69_ai-company-delivery-package-acceptance-implementation-decision-handoff.md',
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

assert.match(plan, /^# AI Company DeliveryPackage Acceptance Plan$/m);
assertSections(plan, [
  'Purpose',
  'Accepted Planning-Only Decision',
  'Current Baseline Evidence',
  'Architecture Choice',
  'Entry Gate',
  'Planned State Schema v10',
  'DeliveryPackageAcceptance Contract',
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
  /operator-delegated-ai-company-delivery-package-acceptance-planning-001/,
  /approve-ai-company-delivery-package-acceptance-planning-only/,
  /planning only for one deterministic local schema-v10 append-only DeliveryPackageAcceptance record/,
  /existing DeliveryPackage record is not modified|기존 DeliveryPackage record는 수정하지 않으며/,
  /deliveryPackageId previewId sourceDigest packageDigest checkpointId checkpointDigest decision=accept/,
  /Migration from valid schema v9 is additive/,
  /create no acceptance during migration/,
  /GET \/api\/delivery-packages\/:deliveryPackageId\/acceptance/,
  /POST \/api\/delivery-packages\/:deliveryPackageId\/accept/,
  /Mission\/task close-out, done, commit\/push\/release/,
  /Planning-only authority: accepted as `DEC-101`/,
  /Complete fielded implementation handoff: documented as `DEC-102`/,
  /Schema\/runtime\/API\/UI implementation: accepted as `DEC-103`/,
]);

assert.match(
  handoff,
  /^# AI Company DeliveryPackage Acceptance Implementation Decision Handoff$/m,
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
  /operator-decision-ai-company-delivery-package-acceptance-implementation-001/,
  /approve-ai-company-delivery-package-acceptance-implementation-slice/,
  /one deterministic local schema-v10 append-only DeliveryPackageAcceptance record/,
  /create no acceptance during migration/,
  /stillBlockedAuthorities=DeliveryPackage rejection changes-requested/,
  /`approval`.*`approved`.*`continue`.*`do everything`.*`approve all`.*`self approve`.*`use your judgment`/,
]);

assert.match(decisionLog, /^### DEC-101$/m);
assert.match(decisionLog, /^### DEC-102$/m);
assert.match(decisionLog, /^### DEC-103$/m);
assert.match(masterPlan, /DeliveryPackage acceptance planning은 `DEC-101`/);
assert.match(runtimeContract, /DeliveryPackage acceptance planning은 `DEC-101`/);
assert.match(councilProtocol, /DeliveryPackage acceptance planning은 `DEC-101`/);
assertAll(roadmapText, [
  /DeliveryPackage acceptance planning은 `DEC-101`/,
  /complete fielded implementation handoff는 `DEC-102`/,
]);
assert.match(
  completionInventory,
  /AI Company DeliveryPackage acceptance planning \| pass/,
);
assertAll(readmeText, [
  /DeliveryPackage acceptance planning is accepted by `DEC-101`/,
  /complete fielded implementation handoff is recorded by `DEC-102`/,
  /exact implementation is accepted by `DEC-103`/,
]);
assert.match(taskLedger, /ai-company-delivery-package-acceptance-planning-post-m7-1954/);
assert.match(taskLedger, /ai-company-delivery-package-acceptance-implementation-post-m7-1955/);
assert.match(
  lessons,
  /Package acceptance should be an append-only fact instead of a rewrite of immutable delivery evidence/,
);
assert.match(verification, /id: 'ai-company-delivery-package-acceptance-planning'/);
assert.match(
  verification,
  /script: 'scripts\/smoke-ai-company-delivery-package-acceptance-planning\.mjs'/,
);
assert.match(verification, /id: 'ai-company-delivery-package-acceptance-implementation'/);
assert.match(verification, /id: 'ai-company-delivery-package-acceptance-ui-api'/);

// Preserve planning provenance while pinning the exact implementation boundary it authorized.
assert.match(contracts, /const STATE_SCHEMA_VERSION = 16/);
assert.match(contracts, /const DELIVERY_PACKAGE_STATUS = \{\s+REVIEW_REQUIRED: 'review-required'/);
assert.match(contracts, /deliveryPackageAcceptance/);
assert.match(fileStore, /validateDeliveryPackageAcceptanceRecords/);
assert.match(runtimeService, /function acceptDeliveryPackage\(/);
assert.match(runtimeService, /function getDeliveryPackageAcceptance\(/);
assert.match(server, /deliveryPackageAcceptMatch/);
assert.match(ui, /data-action="accept-delivery-package"/);
assert.doesNotMatch(ui, /data-action="complete-mission-from-delivery-package"/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      decision: {
        planning: 'accepted-dec-101',
        handoff: 'documented-dec-102',
        implementation: 'accepted-dec-103',
      },
      plannedPath: {
        currentSchemaVersion: 10,
        plannedSchemaVersion: 10,
        sourcePackageImmutable: true,
        recordType: 'DeliveryPackageAcceptance',
        decision: 'accepted',
        exactDigestTuple: [
          'deliveryPackageId',
          'previewId',
          'sourceDigest',
          'packageDigest',
          'checkpointId',
          'checkpointDigest',
          'decision=accept',
        ],
      },
      currentRuntime: {
        schemaVersion: 12,
        acceptanceRecords: true,
        acceptanceRoutes: true,
        acceptanceUiAction: true,
        missionDone: false,
      },
      authority: {
        planningAllowed: true,
        implementationAllowed: true,
        packageAcceptanceAllowed: true,
        packageRejectionAllowed: false,
        missionDoneAllowed: false,
        taskCloseOutAllowed: false,
        runtimeAgentCommitAllowed: false,
        runtimeAgentPushAllowed: false,
        releaseAllowed: false,
        learningAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
