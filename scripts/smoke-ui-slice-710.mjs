import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getReworkQaExecutionRequest } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const signals = fs.readFileSync(path.join(repoRoot, 'ui', 'council-signals.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const server = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-710' });

assert.match(signals, /export function getReworkQaExecutionRequest/);
assert.match(server, /\/qa-execution\$/);
assert.match(server, /runtime\.getReworkQaExecution/);
assert.match(server, /executionCoordinator\.runReworkQaExecution/);
assert.match(app, /function renderReworkQaExecution/);
assert.match(app, /data-form="run-rework-qa-execution"/);
assert.match(app, /data-action="run-rework-qa-execution"/);
assert.match(app, />\s*재작업 QA 실행\s*</);
assert.match(app, /run-only-source-bound-node-checks-and-stop-before-delivery-package/);
assert.match(app, /process\.execPath --check -/);
assert.match(app, /state\.reworkQaExecution = null/);
assert.match(styles, /\.rework-qa-execution/);
assert.match(styles, /\.rework-qa-source-evidence/);
assert.match(styles, /overflow-wrap: anywhere/);
assert.match(styles, /@media \(max-width: 720px\)/);

const renderStart = app.indexOf('function renderReworkQaExecution');
const renderEnd = app.indexOf('\nfunction renderBuilderReworkSourceMutation', renderStart);
const renderSurface = app.slice(renderStart, renderEnd);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:run-qa|retry-qa|resume-qa|recover-qa|preview-execution-plan-delivery|persist-delivery-package|run-local-commit|run-release)"/,
);

const requestSource = {
  reviewerReexecutionAttemptId: 'work-order-attempt-0004',
  reviewerReexecutionAttemptRecordDigest: 'a'.repeat(64),
  reviewerRunId: 'run-0010',
  reviewerEvidenceDigest: 'b'.repeat(64),
  mutationEvidenceDigest: 'c'.repeat(64),
  qaWorkOrderId: 'execution-plan-0001-qa',
  qaWorkOrderDigest: 'd'.repeat(64),
  qaReadyCheckpointId: 'workflow-checkpoint-0004',
  checkpointDigest: 'e'.repeat(64),
  inputDigest: 'f'.repeat(64),
  authorityDigest: '1'.repeat(64),
  sourceDigest: '2'.repeat(64),
  qaInputDigest: '3'.repeat(64),
};
const envelope = {
  reworkPlanId: 'rework-plan-0001',
  status: 'ready',
  requestSource,
};
const reviewedAt = '2026-07-29T00:00:00.000Z';
const request = getReworkQaExecutionRequest(envelope, {
  acknowledgement:
    'run-only-source-bound-node-checks-and-stop-before-delivery-package',
  rationale: ' Run one exact source-bound syntax check. ',
  reviewedAt,
});

assert.deepEqual(Object.keys(request), [
  'reviewerReexecutionAttemptId',
  'reviewerReexecutionAttemptRecordDigest',
  'reviewerRunId',
  'reviewerEvidenceDigest',
  'mutationEvidenceDigest',
  'qaWorkOrderId',
  'qaWorkOrderDigest',
  'qaReadyCheckpointId',
  'checkpointDigest',
  'inputDigest',
  'authorityDigest',
  'sourceDigest',
  'qaInputDigest',
  'evaluatedAt',
  'qaRequest',
]);
assert.deepEqual(Object.keys(request.qaRequest), [
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);
assert.equal(request.qaRequest.rationale, 'Run one exact source-bound syntax check.');
assert.equal(request.evaluatedAt, request.qaRequest.reviewedAt);
assert.equal(
  getReworkQaExecutionRequest(envelope, {
    acknowledgement: 'run-qa-and-delivery-package',
    rationale: 'Invalid authority widening.',
    reviewedAt,
  }),
  null,
);
assert.equal(
  getReworkQaExecutionRequest(
    {
      ...envelope,
      requestSource: { ...requestSource, qaInputDigest: 'stale' },
    },
    {
      acknowledgement:
        'run-only-source-bound-node-checks-and-stop-before-delivery-package',
      rationale: 'Stale evidence cannot run QA.',
      reviewedAt,
    },
  ),
  null,
);

process.stdout.write(
  `${JSON.stringify({
    ok: true,
    mode: 'ui-slice-710',
    action: 'exact-rework-qa-execution',
    evidenceStates: ['ready', 'running', 'completed', 'failed', 'interrupted'],
    downstreamControls: 'absent',
    genericQaStep: 'suppressed',
    responsive: 'desktop-mobile-bounded',
  }, null, 2)}\n`,
);
