import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getBuilderReworkMutationApprovalRequest } from '../ui/council-signals.js';
import { getApprovalActionLabel } from '../ui/execution-labels.js';
import { getTaskApprovalBridge } from '../ui/task-summaries.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const signals = fs.readFileSync(path.join(repoRoot, 'ui', 'council-signals.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const server = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-707' });

assert.match(signals, /export function getBuilderReworkMutationApprovalRequest/);
assert.match(
  server,
  /\/builder-rework-mutation-approval\$/,
);
assert.match(server, /runtime\.getBuilderReworkMutationApproval/);
assert.match(server, /runtime\.requestBuilderReworkMutationApproval/);
assert.match(app, /data-form="request-builder-rework-mutation-approval"/);
assert.match(app, /data-action="request-builder-rework-mutation-approval"/);
assert.match(app, />\s*Mutation approval 요청\s*</);
assert.match(app, /Builder rework mutation approval/);
assert.match(app, /Reviewer Decision 우선/);
assert.match(app, /source mutation blocked/);
assert.match(app, /data-action="run-inbox-action"/);
assert.match(app, /data-verb="approve"/);
assert.match(app, /data-verb="reject"/);
assert.match(
  app,
  /state\.builderReworkMutationApproval = null;/,
);
assert.match(styles, /\.builder-rework-mutation-approval/);
assert.match(styles, /\.builder-rework-mutation-priority/);
assert.match(styles, /overflow-wrap: anywhere/);
assert.match(styles, /@media \(max-width: 720px\)/);

const renderStart = app.indexOf(
  'function renderBuilderReworkMutationApproval',
);
const renderEnd = app.indexOf(
  '\nfunction renderReviewerReworkPlanRecord',
  renderStart,
);
const renderSurface = app.slice(renderStart, renderEnd);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:run-builder-live-mutation|retry-builder-rework|resume-builder-rework|run-reviewer|run-qa|run-local-commit|run-release)"/,
);

const envelope = {
  readiness: {
    status: 'request-ready',
    requestSource: {
      builderReworkDispatchId: 'builder-rework-dispatch-0001',
      builderReworkDispatchDigest: 'a'.repeat(64),
      workOrderAttemptId: 'workOrderAttempt-0003',
      workOrderAttemptRecordDigest: 'b'.repeat(64),
      preflightRunId: 'run-0005',
      preflightRunRecordDigest: 'c'.repeat(64),
      preflightArtifactId: 'artifact-0005',
      preflightArtifactRecordDigest: 'd'.repeat(64),
      preflightArtifactContentDigest: 'e'.repeat(64),
      sourceProgressDigest: 'f'.repeat(64),
    },
  },
};
const request = getBuilderReworkMutationApprovalRequest(envelope, {
  rationale: ' Review one exact source-bound mutation gate. ',
  reviewedAt: '2026-07-29T00:00:00.000Z',
});
assert.deepEqual(Object.keys(request), [
  'builderReworkDispatchId',
  'builderReworkDispatchDigest',
  'workOrderAttemptId',
  'workOrderAttemptRecordDigest',
  'preflightRunId',
  'preflightRunRecordDigest',
  'preflightArtifactId',
  'preflightArtifactRecordDigest',
  'preflightArtifactContentDigest',
  'sourceProgressDigest',
  'evaluatedAt',
  'approvalRequest',
]);
assert.deepEqual(Object.keys(request.approvalRequest), [
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);
assert.equal(
  request.approvalRequest.rationale,
  'Review one exact source-bound mutation gate.',
);
assert.equal(
  getBuilderReworkMutationApprovalRequest(
    { readiness: { status: 'approved', requestSource: envelope.readiness.requestSource } },
    {
      rationale: 'No terminal replay.',
      reviewedAt: '2026-07-29T00:00:00.000Z',
    },
  ),
  null,
);
assert.equal(
  getApprovalActionLabel('builder-rework-live-mutation'),
  'Builder 재작업 변경',
);

const task = { id: 'task-0001', artifactIds: [] };
const approval = {
  id: 'approval-0001',
  taskId: task.id,
  status: 'approved',
  scope: 'builder-rework',
  allowedNextAction: 'builder-rework-live-mutation',
  targetArtifactId: 'artifact-0005',
};
const bridge = getTaskApprovalBridge(task, {
  approvals: [approval],
  inboxItems: [],
  artifactMap: new Map([
    ['artifact-0005', { id: 'artifact-0005', type: 'preflight' }],
  ]),
});
assert.equal(bridge.actionLabel, 'Builder 재작업 변경');
assert.match(bridge.nextStepCopy, /source mutation은 별도 권한 전까지 차단/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'ui-slice-707',
      approval: 'review-only',
      reviewerPriority: 'preserved',
      downstreamControls: 'absent',
    },
    null,
    2,
  )}\n`,
);
