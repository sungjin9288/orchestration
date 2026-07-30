import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  REWORK_DELIVERY_PREVIEW_RESPONSE_KEYS,
  getReworkDeliveryPackagePreviewQuery,
  getReworkDeliveryPackageRecordRequest,
  isExactReworkDeliveryPackagePreview,
  isExactReworkDeliveryPackageRecord,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const signals = fs.readFileSync(
  path.join(repoRoot, 'ui', 'council-signals.js'),
  'utf8',
);
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const server = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-712' });

assert.match(signals, /export function getReworkDeliveryPackagePreviewQuery/);
assert.match(server, /\/delivery-package-preview\$\//);
assert.match(server, /method !== 'GET'/);
assert.match(server, /requires exactly nine canonical bounded query fields/);
assert.match(server, /REWORK_DELIVERY_PREVIEW_IDENTIFIER_PATTERN/);
assert.match(server, /REWORK_DELIVERY_PREVIEW_DIGEST_PATTERN/);
assert.match(server, /new Date\(query\.evaluatedAt\)\.toISOString\(\)/);
assert.match(server, /runtime\.previewReworkDeliveryPackage/);
assert.ok(
  server.indexOf('REWORK_DELIVERY_PREVIEW_IDENTIFIER_PATTERN.test') <
    server.indexOf('runtime.previewReworkDeliveryPackage'),
);
assert.match(app, /async function previewReworkDeliveryPackage/);
assert.match(app, /isExactReworkDeliveryPackagePreview/);
assert.match(app, /function renderReworkDeliveryPackagePreview/);
assert.match(app, /data-action="preview-rework-delivery-package"/);
assert.match(app, />\s*재작업 DeliveryPackage 미리보기\s*</);
assert.match(app, /state\.reworkDeliveryPackagePreview = null/);
assert.match(
  app,
  /executionPlanBundle\?\.executionPlan\.status === 'delivery-ready' &&\s+!state\.reviewerReworkPlan/,
);
assert.match(
  app,
  /source-mutation-completed-reviewer-blocked/,
);
assert.match(
  app,
  /state\.reworkQaExecution\?\.reworkPlanId === record\.id\s+\? renderReworkQaExecution/,
);
const surfaceChangeStart = app.indexOf('async function handleSurfaceChange');
const surfaceChangeEnd = app.indexOf(
  '\nasync function handleNavGroupChange',
  surfaceChangeStart,
);
const surfaceChange = app.slice(surfaceChangeStart, surfaceChangeEnd);
assert.match(surfaceChange, /state\.reworkDeliveryPackagePreview = null/);
assert.doesNotMatch(surfaceChange, /state\.reviewerReworkPlan = null/);
assert.match(app, /Response-only DeliveryPackage/);
assert.match(app, /browser memory에만 유지됩니다/);
assert.match(styles, /\.rework-delivery-package-preview/);
assert.match(styles, /\.rework-delivery-workorders/);
assert.match(styles, /grid-template-columns: minmax\(64px, 0\.6fr\)/);
assert.match(styles, /@media \(max-width: 720px\)/);
assert.match(styles, /overflow-wrap: anywhere/);
assert.match(server, /\/delivery-packages\$\//);
assert.match(server, /requires exactly thirteen fields/);
assert.match(server, /readBoundedJsonBody/);
assert.match(server, /runtime\.persistReworkDeliveryPackage/);
assert.match(server, /runtime\.getReworkPlanDeliveryPackage/);
assert.match(server, /runtime\.getReworkDeliveryPackage/);
assert.match(app, /async function recordReworkDeliveryPackage/);
assert.match(app, /getReworkDeliveryPackageRecordRequest/);
assert.match(app, /isExactReworkDeliveryPackageRecord/);
assert.match(app, /data-form="record-rework-delivery-package"/);
assert.match(app, /data-action="record-rework-delivery-package"/);
assert.match(app, />\s*재작업 DeliveryPackage 기록\s*</);
assert.match(app, /function renderReworkDeliveryPackageRecord/);
assert.match(app, /data-rework-delivery-record-status/);
assert.match(app, /\/delivery-package`,\s*\)\s*\)\?\.reworkDeliveryPackage/);
assert.doesNotMatch(
  app,
  /state\.reworkDeliveryPackage = state\.reworkQaExecution\s*\?/,
);
assert.match(
  app,
  /state\.reworkDeliveryPackage\?\.reworkPlanId === record\.id\s*\? renderReworkDeliveryPackageRecord/,
);
assert.match(styles, /\.rework-delivery-package-record/);
assert.match(styles, /\.rework-delivery-record-form/);

const renderStart = app.indexOf(
  'function renderReworkDeliveryPackagePreview',
);
const renderEnd = app.indexOf(
  '\nfunction renderBuilderReworkSourceMutation',
  renderStart,
);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
const renderSurface = app.slice(renderStart, renderEnd);
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:persist-delivery-package|accept-delivery-package|reject-delivery-package|request-package-changes|close-mission|close-task|retry-qa|recover-qa|run-local-commit|run-push|run-release|run-provider)"/,
);

const finishedAt = '2026-07-30T00:00:00.000Z';
const evaluatedAt = '2026-07-30T00:00:01.000Z';
const envelope = {
  status: 'completed',
  nextGate: 'separate-delivery-package-decision-required',
  workOrderAttempt: {
    id: 'work-order-attempt-0006',
    recordDigest: 'a'.repeat(64),
    status: 'completed',
  },
  qaRun: {
    id: 'run-0012',
    status: 'completed',
    finishedAt,
    summary: { verdict: 'passed' },
  },
  qaArtifact: {
    id: 'artifact-0014',
    type: 'qa-evidence',
  },
  qaWorkOrder: {
    id: 'work-order-0003',
  },
  terminalCheckpoint: {
    id: 'workflow-checkpoint-0006',
    stage: 'delivery-ready',
    status: 'terminal',
    checkpointDigest: 'b'.repeat(64),
  },
  sourceDigest: 'c'.repeat(64),
  qaInputDigest: 'd'.repeat(64),
};
const query = getReworkDeliveryPackagePreviewQuery(envelope, evaluatedAt);

assert.deepEqual(Object.keys(query), [
  'qaWorkOrderAttemptId',
  'qaWorkOrderAttemptRecordDigest',
  'qaRunId',
  'qaEvidenceArtifactId',
  'deliveryReadyCheckpointId',
  'checkpointDigest',
  'sourceDigest',
  'qaInputDigest',
  'evaluatedAt',
]);
assert.deepEqual(query, {
  qaWorkOrderAttemptId: envelope.workOrderAttempt.id,
  qaWorkOrderAttemptRecordDigest: envelope.workOrderAttempt.recordDigest,
  qaRunId: envelope.qaRun.id,
  qaEvidenceArtifactId: envelope.qaArtifact.id,
  deliveryReadyCheckpointId: envelope.terminalCheckpoint.id,
  checkpointDigest: envelope.terminalCheckpoint.checkpointDigest,
  sourceDigest: envelope.sourceDigest,
  qaInputDigest: envelope.qaInputDigest,
  evaluatedAt,
});
assert.equal(
  getReworkDeliveryPackagePreviewQuery(
    {
      ...envelope,
      terminalCheckpoint: {
        ...envelope.terminalCheckpoint,
        checkpointDigest: 'stale',
      },
    },
    evaluatedAt,
  ),
  null,
);
assert.equal(
  getReworkDeliveryPackagePreviewQuery(
    {
      ...envelope,
      qaRun: {
        ...envelope.qaRun,
        finishedAt: 'not-a-timestamp',
      },
    },
    evaluatedAt,
  ),
  null,
);
assert.equal(
  getReworkDeliveryPackagePreviewQuery(
    {
      ...envelope,
      qaRun: {
        ...envelope.qaRun,
        summary: { verdict: 'failed' },
      },
    },
    evaluatedAt,
  ),
  null,
);
assert.equal(
  getReworkDeliveryPackagePreviewQuery(
    envelope,
    '2026-07-29T23:59:59.999Z',
  ),
  null,
);

const authoritySummary = Object.fromEntries(
  [
    'approvalBypassAllowed',
    'commitAllowed',
    'durablePersistenceAllowed',
    'learningApplicationAllowed',
    'memoryApplicationAllowed',
    'missionCloseOutAllowed',
    'packageAcceptanceAllowed',
    'packageDecisionAllowed',
    'profilePolicyMutationAllowed',
    'providerExecutionAllowed',
    'pushAllowed',
    'recoveryAllowed',
    'releaseAllowed',
    'retryAllowed',
    'schedulingAllowed',
    'sourceMutationAllowed',
    'taskCloseOutAllowed',
  ].map((key) => [key, false]),
);
const blockedActions = [
  'persist-delivery-package',
  'accept-delivery-package',
  'reject-delivery-package',
  'request-package-changes',
  'close-mission',
  'close-task',
  'retry-qa',
  'recover-qa',
  'execute-provider',
  'mutate-source',
  'apply-memory',
  'commit',
  'push',
  'release',
  'schedule-background',
  'mutate-policy',
  'bypass-approval',
];
const previewDigest = 'e'.repeat(64);
const reworkPlan = {
  id: 'rework-plan-0001',
  projectId: 'project-0001',
  missionId: 'mission-0001',
  executionPlanId: 'execution-plan-0001',
  reviewerWorkOrderId: 'work-order-0002',
  evidenceRefs: {
    builderWorkOrderRef: 'work-order-0001',
  },
};
const preview = {
  id: `rework-delivery-package-preview-${previewDigest.slice(0, 16)}`,
  schemaVersion: 24,
  persisted: false,
  status: 'rework-delivery-preview-ready',
  projectId: 'project-0001',
  missionId: 'mission-0001',
  executionPlanId: 'execution-plan-0001',
  reworkPlanId: reworkPlan.id,
  qaWorkOrderId: 'work-order-0003',
  qaWorkOrderAttemptId: query.qaWorkOrderAttemptId,
  qaRunId: query.qaRunId,
  qaEvidenceArtifactId: query.qaEvidenceArtifactId,
  terminalCheckpointId: query.deliveryReadyCheckpointId,
  terminalCheckpointDigest: query.checkpointDigest,
  sourceDigest: query.sourceDigest,
  mutationEvidenceDigest: 'f'.repeat(64),
  reviewerEvidenceDigest: '1'.repeat(64),
  qaInputDigest: query.qaInputDigest,
  reworkDeliveryEvidenceDigest: '2'.repeat(64),
  deliveredArtifactRefs: [
    'artifact-0010',
    'artifact-0012',
    'artifact-0014',
  ],
  workOrderResults: [
    {
      workOrderId: 'work-order-0001',
      role: 'builder',
      status: 'completed',
      attemptRefs: ['work-order-attempt-0004'],
      runRefs: ['run-0008'],
      artifactRefs: ['artifact-0010'],
    },
    {
      workOrderId: 'work-order-0002',
      role: 'reviewer',
      status: 'completed',
      attemptRefs: ['work-order-attempt-0005'],
      runRefs: ['run-0009'],
      artifactRefs: ['artifact-0012'],
    },
    {
      workOrderId: envelope.qaWorkOrder.id,
      role: 'qa',
      status: 'completed',
      attemptRefs: ['work-order-attempt-0006'],
      runRefs: ['run-0010'],
      artifactRefs: ['artifact-0014'],
    },
  ],
  verificationSummary: {
    verdict: 'passed',
    mutationDetected: false,
  },
  acceptedRisks: ['Node.js syntax only'],
  unresolvedItems: [],
  authoritySummary,
  generatedAt: finishedAt,
  evaluatedAt,
  allowedActions: [],
  blockedActions,
  previewDigest,
};
assert.deepEqual(
  Object.keys(preview).sort(),
  REWORK_DELIVERY_PREVIEW_RESPONSE_KEYS,
);
assert.equal(
  isExactReworkDeliveryPackagePreview(
    preview,
    reworkPlan,
    envelope,
    query,
  ),
  true,
);
assert.equal(
  isExactReworkDeliveryPackagePreview(
    {
      ...preview,
      authoritySummary: {
        ...authoritySummary,
        durablePersistenceAllowed: true,
      },
    },
    reworkPlan,
    envelope,
    query,
  ),
  false,
);
assert.equal(
  isExactReworkDeliveryPackagePreview(
    { ...preview, unexpectedAuthority: true },
    reworkPlan,
    envelope,
    query,
  ),
  false,
);
assert.equal(
  isExactReworkDeliveryPackagePreview(
    {
      ...preview,
      workOrderResults: preview.workOrderResults.map((entry, index) =>
        index === 1
          ? { ...entry, runRefs: [] }
          : entry),
    },
    reworkPlan,
    envelope,
    query,
  ),
  false,
);
assert.equal(
  isExactReworkDeliveryPackagePreview(
    {
      ...preview,
      workOrderResults: preview.workOrderResults.map((entry, index) =>
        index === 2
          ? { ...entry, workOrderId: 'work-order-stale' }
          : entry),
    },
    reworkPlan,
    envelope,
    query,
  ),
  false,
);
assert.equal(
  isExactReworkDeliveryPackagePreview(
    { ...preview, qaWorkOrderId: 'work-order-stale' },
    reworkPlan,
    envelope,
    query,
  ),
  false,
);
assert.equal(
  isExactReworkDeliveryPackagePreview(
    {
      ...preview,
      workOrderResults: preview.workOrderResults.map((entry, index) =>
        index === 0
          ? { ...entry, attemptRefs: [123] }
          : entry),
    },
    reworkPlan,
    envelope,
    query,
  ),
  false,
);

const recordRequest = getReworkDeliveryPackageRecordRequest(
  preview,
  envelope,
  {
    acknowledgement:
      'record-exact-rework-delivery-package-without-acceptance-or-close-out',
    rationale: 'Retain the exact rework delivery evidence for review.',
    reviewedAt: '2026-07-30T00:00:02.000Z',
  },
);
assert.deepEqual(Object.keys(recordRequest), [
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
  'recordApproval',
]);
assert.equal(
  recordRequest.recordApproval.decision,
  'record-rework-delivery-package',
);
assert.equal(
  getReworkDeliveryPackageRecordRequest(preview, envelope, {
    acknowledgement: '',
    rationale: 'Retain evidence.',
    reviewedAt: '2026-07-30T00:00:02.000Z',
  }),
  null,
);
assert.equal(
  getReworkDeliveryPackageRecordRequest(preview, envelope, {
    acknowledgement:
      'record-exact-rework-delivery-package-without-acceptance-or-close-out',
    rationale: '',
    reviewedAt: '2026-07-30T00:00:02.000Z',
  }),
  null,
);

const record = {
  ...preview,
  id: 'rework-delivery-package-0001',
  persisted: true,
  status: 'review-required',
  previewId: preview.id,
  previewDigest: preview.previewDigest,
  previewEvaluatedAt: preview.evaluatedAt,
  recordApproval: recordRequest.recordApproval,
  recordApprovalDigest: '3'.repeat(64),
  createdAt: recordRequest.recordApproval.reviewedAt,
  recordDigest: '4'.repeat(64),
};
delete record.schemaVersion;
delete record.evaluatedAt;
assert.equal(
  isExactReworkDeliveryPackageRecord(record, preview, reworkPlan),
  true,
);
assert.equal(
  isExactReworkDeliveryPackageRecord(
    { ...record, status: 'accepted' },
    preview,
    reworkPlan,
  ),
  false,
);
assert.equal(
  isExactReworkDeliveryPackageRecord(
    { ...record, allowedActions: ['accept-delivery-package'] },
    preview,
    reworkPlan,
  ),
  false,
);

const durableRenderStart = app.indexOf(
  'function renderReworkDeliveryPackageRecord',
);
const durableRenderEnd = app.indexOf(
  '\nfunction renderBuilderReworkSourceMutation',
  durableRenderStart,
);
const durableRenderSurface = app.slice(
  durableRenderStart,
  durableRenderEnd,
);
assert.doesNotMatch(
  durableRenderSurface,
  /data-action="(?:accept-delivery-package|reject-delivery-package|request-package-changes|close-mission|close-task|retry-qa|recover-qa|run-local-commit|run-push|run-release|run-provider)"/,
);

process.stdout.write(
  `${JSON.stringify({
    ok: true,
    mode: 'ui-slice-712',
    action: 'record-exact-rework-delivery-package',
    transport: 'bounded-thirteen-key-post-and-exact-get',
    persistence: 'immutable-review-required-record',
    downstreamControls: 'absent',
    responsive: 'desktop-mobile-bounded',
  }, null, 2)}\n`,
);
