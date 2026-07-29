import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getBuilderReworkSourceMutationRequest } from '../ui/council-signals.js';
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

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-708' });

assert.match(signals, /export function getBuilderReworkSourceMutationRequest/);
assert.match(server, /\/builder-rework-source-mutation\$/);
assert.match(server, /runtime\.getBuilderReworkSourceMutation/);
assert.match(
  server,
  /executionCoordinator\.runBuilderReworkSourceMutation/,
);
assert.match(app, /function renderBuilderReworkSourceMutation/);
assert.match(app, /data-form="run-builder-rework-source-mutation"/);
assert.match(app, /data-action="run-builder-rework-source-mutation"/);
assert.match(app, />\s*Builder rework 적용\s*</);
assert.match(
  app,
  /mutate-only-approved-rework-targets-and-stop-before-reviewer/,
);
assert.match(app, /Immutable target allowlist/);
assert.match(app, /Reviewer와 QA는 실행되지 않았습니다/);
assert.match(app, /mutation\.nextGate \|\| 'blocked'/);
assert.match(styles, /\.builder-rework-source-mutation/);
assert.match(styles, /\.builder-rework-acknowledgement/);
assert.match(styles, /overflow-wrap: anywhere/);
assert.match(styles, /@media \(max-width: 720px\)/);

const renderStart = app.indexOf('function renderBuilderReworkSourceMutation');
const renderEnd = app.indexOf(
  '\nfunction renderBuilderReworkMutationApproval',
  renderStart,
);
const renderSurface = app.slice(renderStart, renderEnd);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:run-reviewer|run-qa|retry-builder-rework|resume-builder-rework|recover-builder-rework|run-local-commit|run-release)"/,
);

const source = {
  builderReworkDispatchId: 'builder-rework-dispatch-0001',
  builderReworkDispatchDigest: 'a'.repeat(64),
  workOrderAttemptId: 'work-order-attempt-0003',
  workOrderAttemptRecordDigest: 'b'.repeat(64),
  preflightRunId: 'run-0005',
  preflightRunRecordDigest: 'c'.repeat(64),
  preflightArtifactId: 'artifact-0005',
  preflightArtifactRecordDigest: 'd'.repeat(64),
  preflightArtifactContentDigest: 'e'.repeat(64),
  sourceProgressDigest: 'f'.repeat(64),
};
const envelope = {
  readiness: {
    status: 'approved',
    requestSource: source,
  },
  approval: {
    id: 'approval-0001',
    status: 'approved',
    scope: 'builder-rework',
    allowedNextAction: 'builder-rework-live-mutation',
    metadata: { bindingDigest: '1'.repeat(64) },
  },
};
const reviewedAt = '2026-07-29T00:00:00.000Z';
const request = getBuilderReworkSourceMutationRequest(envelope, {
  acknowledgement:
    'mutate-only-approved-rework-targets-and-stop-before-reviewer',
  rationale: ' Apply the exact approved Builder rework target once. ',
  reviewedAt,
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
  'mutationApprovalId',
  'mutationApprovalBindingDigest',
  'sourceProgressDigest',
  'evaluatedAt',
  'mutationRequest',
]);
assert.deepEqual(Object.keys(request.mutationRequest), [
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);
assert.equal(
  request.mutationRequest.rationale,
  'Apply the exact approved Builder rework target once.',
);
assert.equal(request.evaluatedAt, request.mutationRequest.reviewedAt);
assert.equal(
  getBuilderReworkSourceMutationRequest(envelope, {
    acknowledgement: 'widen-source',
    rationale: 'Invalid acknowledgement.',
    reviewedAt,
  }),
  null,
);
assert.equal(
  getBuilderReworkSourceMutationRequest(
    {
      ...envelope,
      approval: { ...envelope.approval, status: 'pending' },
    },
    {
      acknowledgement:
        'mutate-only-approved-rework-targets-and-stop-before-reviewer',
      rationale: 'Pending approval cannot mutate.',
      reviewedAt,
    },
  ),
  null,
);
assert.equal(
  getBuilderReworkSourceMutationRequest(
    {
      ...envelope,
      readiness: {
        ...envelope.readiness,
        requestSource: {
          ...source,
          sourceProgressDigest: 'stale',
        },
      },
    },
    {
      acknowledgement:
        'mutate-only-approved-rework-targets-and-stop-before-reviewer',
      rationale: 'Stale evidence cannot mutate.',
      reviewedAt,
    },
  ),
  null,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'ui-slice-708',
      action: 'exact-approved-source-mutation',
      evidenceStates: ['ready', 'running', 'completed', 'failed'],
      downstreamControls: 'absent',
      responsive: 'desktop-mobile-bounded',
    },
    null,
    2,
  )}\n`,
);
