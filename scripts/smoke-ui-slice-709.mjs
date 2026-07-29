import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getMissionOperatorSteppedSchedulerSummary,
  getReviewerReexecutionRequest,
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

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-709' });

assert.match(signals, /export function getReviewerReexecutionRequest/);
assert.match(server, /\/reviewer-reexecution\$/);
assert.match(server, /runtime\.getReviewerReexecution/);
assert.match(server, /executionCoordinator\.runReviewerReexecution/);
assert.match(app, /function renderReviewerReexecution/);
assert.match(app, /data-form="run-reviewer-reexecution"/);
assert.match(app, /data-action="run-reviewer-reexecution"/);
assert.match(app, />\s*Reviewer 재검토\s*</);
assert.match(
  app,
  /review-exact-rework-result-once-and-stop-before-qa/,
);
assert.match(app, /Retained findings/);
assert.match(app, /Mutation evidence/);
assert.match(app, /QA는 실행되지 않았습니다/);
assert.match(app, /state\.reviewerReexecution = null/);
assert.match(styles, /\.reviewer-reexecution/);
assert.match(styles, /\.reviewer-reexecution-findings/);
assert.match(styles, /overflow-wrap: anywhere/);
assert.match(styles, /@media \(max-width: 720px\)/);

const renderStart = app.indexOf('function renderReviewerReexecution');
const renderEnd = app.indexOf(
  '\nfunction renderBuilderReworkSourceMutation',
  renderStart,
);
const renderSurface = app.slice(renderStart, renderEnd);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:run-qa|retry-reviewer|resume-reviewer|recover-reviewer|run-local-commit|run-release)"/,
);

const requestSource = {
  builderReworkDispatchId: 'builder-rework-dispatch-0001',
  builderReworkDispatchDigest: 'a'.repeat(64),
  builderReworkAttemptId: 'work-order-attempt-0003',
  builderReworkAttemptRecordDigest: 'b'.repeat(64),
  mutationRunId: 'run-0008',
  mutationEvidenceDigest: 'c'.repeat(64),
  reviewerWorkOrderId: 'work-order-0002',
  reviewerWorkOrderDigest: 'd'.repeat(64),
  sourceReviewerAttemptId: 'work-order-attempt-0002',
  sourceReviewerAttemptRecordDigest: 'e'.repeat(64),
  sourceProgressDigest: 'f'.repeat(64),
};
const envelope = {
  reworkPlanId: 'rework-plan-0001',
  status: 'ready',
  readiness: {
    status: 'reviewer-ready',
    requestSource,
  },
};
const reviewedAt = '2026-07-29T00:00:00.000Z';
const request = getReviewerReexecutionRequest(envelope, {
  acknowledgement:
    'review-exact-rework-result-once-and-stop-before-qa',
  rationale: ' Review the exact source-current Builder rework once. ',
  reviewedAt,
});

assert.deepEqual(Object.keys(request), [
  'builderReworkDispatchId',
  'builderReworkDispatchDigest',
  'builderReworkAttemptId',
  'builderReworkAttemptRecordDigest',
  'mutationRunId',
  'mutationEvidenceDigest',
  'reviewerWorkOrderId',
  'reviewerWorkOrderDigest',
  'sourceReviewerAttemptId',
  'sourceReviewerAttemptRecordDigest',
  'sourceProgressDigest',
  'evaluatedAt',
  'reviewerRequest',
]);
assert.deepEqual(Object.keys(request.reviewerRequest), [
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);
assert.equal(
  request.reviewerRequest.rationale,
  'Review the exact source-current Builder rework once.',
);
assert.equal(request.evaluatedAt, request.reviewerRequest.reviewedAt);
assert.equal(
  getReviewerReexecutionRequest(envelope, {
    acknowledgement: 'run-reviewer-and-qa',
    rationale: 'Invalid authority widening.',
    reviewedAt,
  }),
  null,
);
assert.equal(
  getReviewerReexecutionRequest(
    {
      ...envelope,
      readiness: {
        ...envelope.readiness,
        requestSource: {
          ...requestSource,
          mutationEvidenceDigest: 'stale',
        },
      },
    },
    {
      acknowledgement:
        'review-exact-rework-result-once-and-stop-before-qa',
      rationale: 'Stale evidence cannot run Reviewer.',
      reviewedAt,
    },
  ),
  null,
);

const schedulerSummary = getMissionOperatorSteppedSchedulerSummary({
  councilSession: { staffingEntryRef: { staffingEntryId: 'staffing-entry-0001' } },
  executionPlan: {
    id: 'execution-plan-0001',
    status: 'reviewing',
    stopReason: 'separate-qa-execution-decision-required',
  },
  latestCheckpoint: {
    id: 'workflow-checkpoint-0004',
    stage: 'qa-ready',
    status: 'ready',
    stopReason: 'reviewer-reexecution-passed-qa-ready',
  },
  terminalGateApproval: null,
  workOrderAttempts: [],
  workOrders: [
    { id: 'work-order-0001', role: 'builder' },
    { id: 'work-order-0002', role: 'reviewer' },
    { id: 'work-order-0003', role: 'qa' },
  ],
});
assert.equal(schedulerSummary.action, null);
assert.equal(schedulerSummary.stepAllowed, false);
assert.match(schedulerSummary.blockedReason, /QA는 별도 실행 결정이 필요/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'ui-slice-709',
      action: 'exact-reviewer-reexecution',
      evidenceStates: [
        'ready',
        'running',
        'completed',
        'changes-requested',
        'failed',
        'interrupted',
      ],
      downstreamControls: 'absent',
      genericQaStep: 'blocked-until-separate-decision',
      responsive: 'desktop-mobile-bounded',
    },
    null,
    2,
  )}\n`,
);
