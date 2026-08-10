import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getOpsAttemptResumeRequest,
  getOpsAttemptResumeSource,
  isExactOpsAttemptResume,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-715';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const server = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

assert.match(server, /OPS_ATTEMPT_RESUME_BODY_KEYS/);
assert.match(server, /body requires exactly sixteen fields/);
assert.match(server, /runtime\.resumeOpsAttemptFromSafeCheckpoint/);
assert.match(server, /runtime\.getOpsAttemptResume/);
assert.match(server, /workOrderAttemptId: started\.replacementAttempt\.id/);
assert.match(app, /async function resumeOpsAttemptFromSafeCheckpoint/);
assert.match(app, /data-action="resume-ops-attempt-safe-checkpoint"/);
assert.match(app, /name="opsAttemptSourceWorkerStoppedAt"/);
assert.match(app, /name="opsAttemptResumeAcknowledgement"/);
assert.match(app, /Resume QA from safe checkpoint/);
assert.match(app, /data-ops-attempt-resume-id/);
assert.match(app, /Source settlement remains denied/);
assert.match(styles, /\.ops-attempt-resume-command/);
assert.match(styles, /\.ops-attempt-resume-acknowledgement/);
assert.match(styles, /\.ops-attempt-resume-action/);
assert.match(styles, /grid-template-columns: 1fr/);

const sourceAttempt = {
  id: 'work-order-attempt-0004',
  executionPlanId: 'execution-plan-0001',
  workOrderId: 'work-order-0003',
  checkpointRef: 'workflow-checkpoint-0003',
  recordDigest: 'a'.repeat(64),
  sourceDigest: 'b'.repeat(64),
  status: 'active',
  role: 'qa',
  action: 'run-qa',
  command: 'step',
  attemptNumber: 1,
};
const disposition = {
  id: 'ops-attempt-disposition-0001',
  recordDigest: 'c'.repeat(64),
  targetType: 'work-order-attempt',
  targetId: sourceAttempt.id,
  parentId: sourceAttempt.executionPlanId,
  targetRecordDigest: sourceAttempt.recordDigest,
  parentDigest: 'd'.repeat(64),
  decision: 'quarantine',
  reasonCode: 'operator-uncertain-outcome-after-interruption',
  authoritySummary: {
    quarantineEvidenceAllowed: true,
    lateSettlementAllowed: false,
  },
};
const snapshot = {
  workOrderAttempts: { [sourceAttempt.id]: sourceAttempt },
  executionPlans: {
    [sourceAttempt.executionPlanId]: {
      id: sourceAttempt.executionPlanId,
      sourceDigest: sourceAttempt.sourceDigest,
      status: 'reviewing',
      activeWorkOrderId: sourceAttempt.workOrderId,
      latestCheckpointId: sourceAttempt.checkpointRef,
      workOrderIds: ['work-order-0001', 'work-order-0002', sourceAttempt.workOrderId],
    },
  },
  workOrders: {
    [sourceAttempt.workOrderId]: {
      id: sourceAttempt.workOrderId,
      executionPlanId: sourceAttempt.executionPlanId,
      status: 'active',
      role: 'qa',
    },
  },
  workflowCheckpoints: {
    [sourceAttempt.checkpointRef]: {
      id: sourceAttempt.checkpointRef,
      executionPlanId: sourceAttempt.executionPlanId,
      sourceDigest: sourceAttempt.sourceDigest,
      stage: 'qa-ready',
      status: 'consumed',
      checkpointDigest: 'e'.repeat(64),
      inputDigest: 'f'.repeat(64),
      authorityDigest: '0'.repeat(64),
    },
  },
};

const source = getOpsAttemptResumeSource(disposition, snapshot);
assert.ok(source);
assert.equal(source.sourceAttempt.id, sourceAttempt.id);
assert.equal(
  getOpsAttemptResumeSource(
    disposition,
    {
      ...snapshot,
      workOrderAttempts: {
        [sourceAttempt.id]: { ...sourceAttempt, role: 'builder' },
      },
    },
  ),
  null,
);
assert.equal(
  getOpsAttemptResumeSource(
    disposition,
    {
      ...snapshot,
      workflowCheckpoints: {
        [sourceAttempt.checkpointRef]: {
          ...snapshot.workflowCheckpoints[sourceAttempt.checkpointRef],
          status: 'ready',
        },
      },
    },
  ),
  null,
);

const acknowledgement = 'source-worker-stopped-and-read-only-qa-confirmed';
const stoppedAt = '2026-08-10T00:00:00.000Z';
const evaluatedAt = '2026-08-10T00:00:01.000Z';
const request = getOpsAttemptResumeRequest(
  source,
  disposition.parentDigest,
  stoppedAt,
  evaluatedAt,
  acknowledgement,
);
assert.deepEqual(Object.keys(request), [
  'dispositionRecordDigest',
  'sourceAttemptId',
  'sourceAttemptRecordDigest',
  'executionPlanId',
  'expectedExecutionPlanDigest',
  'checkpointId',
  'checkpointDigest',
  'inputDigest',
  'authorityDigest',
  'expectedWorkOrderId',
  'action',
  'evaluatedAt',
  'sourceWorkerStopConfirmedAt',
  'decision',
  'acknowledgement',
  'expectedReplacementAttemptNumber',
]);
assert.equal(request.action, 'resume-qa');
assert.equal(request.decision, 'resume-safe-checkpoint');
assert.equal(request.expectedReplacementAttemptNumber, 2);
assert.equal(
  getOpsAttemptResumeRequest(
    source,
    disposition.parentDigest,
    stoppedAt,
    evaluatedAt,
    'unsafe-acknowledgement',
  ),
  null,
);

const resume = {
  id: 'ops-attempt-resume-0001',
  sourceDispositionId: disposition.id,
  sourceDispositionRecordDigest: disposition.recordDigest,
  sourceAttemptId: sourceAttempt.id,
  sourceAttemptRecordDigest: sourceAttempt.recordDigest,
  executionPlanId: source.executionPlan.id,
  workOrderId: source.workOrder.id,
  sourceCheckpointId: source.checkpoint.id,
  sourceCheckpointDigest: source.checkpoint.checkpointDigest,
  sourceInputDigest: source.checkpoint.inputDigest,
  sourceAuthorityDigest: source.checkpoint.authorityDigest,
  replacementAttemptId: 'work-order-attempt-0005',
  action: 'resume-qa',
  role: 'qa',
  decision: 'resume-safe-checkpoint',
  authoritySummary: {
    replacementQaAttemptAllowed: true,
    sourceAttemptSettlementAllowed: false,
    sourceMutationAllowed: false,
    retryAllowed: false,
  },
};
assert.equal(isExactOpsAttemptResume(resume, source), true);
assert.equal(
  isExactOpsAttemptResume(
    { ...resume, replacementAttemptId: sourceAttempt.id },
    source,
  ),
  false,
);
assert.equal(
  isExactOpsAttemptResume(
    {
      ...resume,
      authoritySummary: { ...resume.authoritySummary, retryAllowed: true },
    },
    source,
  ),
  false,
);

const renderStart = app.indexOf('function renderOpsSupervisionPreview');
const renderEnd = app.indexOf(
  '\nfunction renderReviewerReworkPreviewButton',
  renderStart,
);
const renderSurface = app.slice(renderStart, renderEnd);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
assert.equal(
  (renderSurface.match(/data-action="resume-ops-attempt-safe-checkpoint"/g) || [])
    .length,
  1,
);
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:cancel-attempt|retry-attempt|resume-builder|resume-reviewer|resume-specialist|run-provider|commit|push|release)"/,
);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  action: 'resume-one-quarantined-qa-attempt',
  transport: 'bounded-sixteen-key-post-and-exact-id-get',
  gating: 'exact-disposition-checkpoint-worker-stop-acknowledgement',
  hydration: 'exact-resume-locator-only',
  downstreamControls: 'absent',
  responsive: 'desktop-mobile-bounded',
}, null, 2)}\n`);
