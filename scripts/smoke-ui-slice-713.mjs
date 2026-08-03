import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_KEYS,
  getReworkDeliveryPackageAcceptanceRequest,
  isExactReworkDeliveryPackageAcceptance,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const server = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-713' });

assert.match(server, /reworkDeliveryPackageAcceptanceMatch/);
assert.match(server, /body requires exactly fifteen fields/);
assert.match(server, /runtime\.acceptReworkDeliveryPackage/);
assert.match(server, /runtime\.getReworkDeliveryPackageAcceptance/);
assert.match(app, /async function acceptReworkDeliveryPackage/);
assert.match(app, /data-form="accept-rework-delivery-package"/);
assert.match(app, /data-action="accept-rework-delivery-package"/);
assert.match(app, />\s*재작업 DeliveryPackage 승인\s*</);
assert.match(app, /data-rework-delivery-acceptance-status="accepted"/);
assert.match(app, /Acceptance evidence/);
assert.match(app, /reworkDeliveryPackageAcceptance = null/);
assert.match(
  app,
  /\/rework-delivery-packages\/\$\{encodeURIComponent\(state\.reworkDeliveryPackage\.id\)\}\/acceptance/,
);
assert.match(styles, /\.rework-delivery-package-acceptance/);
assert.match(styles, /\.rework-delivery-acceptance-form/);
assert.match(styles, /max-width: 100%/);
assert.match(styles, /white-space: normal/);

const record = {
  id: 'rework-delivery-package-0001',
  persisted: true,
  status: 'review-required',
  projectId: 'project-0001',
  missionId: 'mission-0001',
  executionPlanId: 'execution-plan-0001',
  reworkPlanId: 'rework-plan-0001',
  qaWorkOrderAttemptId: 'work-order-attempt-0006',
  qaRunId: 'run-0012',
  qaEvidenceArtifactId: 'artifact-0014',
  terminalCheckpointId: 'workflow-checkpoint-0006',
  terminalCheckpointDigest: 'a'.repeat(64),
  sourceDigest: 'b'.repeat(64),
  qaInputDigest: 'c'.repeat(64),
  previewEvaluatedAt: '2026-07-30T00:00:01.000Z',
  previewId: 'rework-delivery-package-preview-dddddddddddddddd',
  previewDigest: 'd'.repeat(64),
  reworkDeliveryEvidenceDigest: 'e'.repeat(64),
  recordDigest: 'f'.repeat(64),
};
const envelope = {
  workOrderAttempt: {
    id: record.qaWorkOrderAttemptId,
    recordDigest: '1'.repeat(64),
  },
};
const request = getReworkDeliveryPackageAcceptanceRequest(record, envelope);
assert.deepEqual(Object.keys(request), [
  'reworkPlanId',
  'qaWorkOrderAttemptId',
  'qaWorkOrderAttemptRecordDigest',
  'qaRunId',
  'qaEvidenceArtifactId',
  'deliveryReadyCheckpointId',
  'checkpointDigest',
  'sourceDigest',
  'qaInputDigest',
  'evaluatedAt',
  'previewId',
  'previewDigest',
  'reworkDeliveryEvidenceDigest',
  'reworkDeliveryPackageRecordDigest',
  'decision',
]);
assert.equal(request.decision, 'accept');
assert.equal(request.evaluatedAt, record.previewEvaluatedAt);
assert.equal(
  getReworkDeliveryPackageAcceptanceRequest(record, {
    workOrderAttempt: { ...envelope.workOrderAttempt, id: 'stale' },
  }),
  null,
);

const authoritySummary = Object.fromEntries(
  REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_KEYS.map((key) => [
    key,
    key === 'packageAcceptanceEvidenceAllowed',
  ]),
);
const acceptance = {
  id: 'rework-delivery-package-acceptance-0001',
  projectId: record.projectId,
  missionId: record.missionId,
  executionPlanId: record.executionPlanId,
  reworkPlanId: record.reworkPlanId,
  reworkDeliveryPackageId: record.id,
  previewId: record.previewId,
  previewDigest: record.previewDigest,
  sourceDigest: record.sourceDigest,
  reworkDeliveryEvidenceDigest: record.reworkDeliveryEvidenceDigest,
  reworkDeliveryPackageRecordDigest: record.recordDigest,
  decision: 'accepted',
  authoritySummary,
  acceptanceDigest: '2'.repeat(64),
  createdAt: '2026-07-30T00:00:02.000Z',
};
assert.equal(isExactReworkDeliveryPackageAcceptance(acceptance, record), true);
assert.equal(
  isExactReworkDeliveryPackageAcceptance(
    { ...acceptance, reworkDeliveryPackageRecordDigest: '3'.repeat(64) },
    record,
  ),
  false,
);
assert.equal(
  isExactReworkDeliveryPackageAcceptance(
    {
      ...acceptance,
      authoritySummary: { ...authoritySummary, missionCloseOutAllowed: true },
    },
    record,
  ),
  false,
);

const renderStart = app.indexOf('function renderReworkDeliveryPackageRecord');
const renderEnd = app.indexOf(
  '\nfunction renderBuilderReworkSourceMutation',
  renderStart,
);
const renderSurface = app.slice(renderStart, renderEnd);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:reject-rework-delivery-package|request-rework-package-changes|close-mission|close-task|retry-qa|recover-qa|run-local-commit|run-push|run-release|run-provider)"/,
);

process.stdout.write(
  `${JSON.stringify({
    ok: true,
    mode: 'ui-slice-713',
    action: 'accept-exact-rework-delivery-package',
    transport: 'bounded-fifteen-key-post-and-package-bound-get',
    hydration: 'exact-package-locator',
    downstreamControls: 'absent',
    responsive: 'desktop-mobile-bounded',
  }, null, 2)}\n`,
);
