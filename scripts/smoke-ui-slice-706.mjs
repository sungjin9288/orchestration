import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getBuilderReworkPreflightRequest } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const signals = fs.readFileSync(path.join(repoRoot, 'ui', 'council-signals.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-706' });

assert.match(signals, /export function getBuilderReworkPreflightRequest/);
assert.match(app, /data-action="start-builder-rework-preflight"/);
assert.match(app, /data-form="start-builder-rework-preflight"/);
assert.match(app, /builder-rework-preflight/);
assert.match(app, /builder-rework-dispatch/);
assert.match(app, /state\.builderReworkDispatch = null;/);
assert.match(app, /Run: \$\{escapeHtml/);
assert.match(app, /Artifact: \$\{escapeHtml/);
assert.match(
  app,
  /\/api\/rework-plans\/\$\{encodeURIComponent\(state\.reviewerReworkPlan\.id\)\}\/builder-rework-dispatch/,
);
assert.match(app, /This consumes the one dispatch cap and stops before mutation approval\./);
assert.match(app, /\['active', 'waiting-gate', 'failed'\]/);
assert.match(app, /worker interruption evidence를 복원했습니다/);
assert.match(styles, /\.builder-rework-dispatch/);
assert.match(styles, /\.builder-rework-dispatch code[\s\S]*overflow-wrap: anywhere/);
assert.match(styles, /@media \(max-width: 720px\)/);
assert.doesNotMatch(app, /data-action="(?:retry-builder-rework|run-reviewer-rework|run-qa-rework|approve-builder-rework-mutation|commit-builder-rework|push-builder-rework|release-builder-rework)"/);

const record = {
  id: 'rework-plan-0001', persisted: true, status: 'review-required',
  recordDigest: 'a'.repeat(64), sourceExecutionPlanDigest: 'b'.repeat(64),
  sourceAttemptRecordDigest: 'c'.repeat(64), sourceProgressDigest: 'd'.repeat(64),
  nextAttemptNumber: 2, maxAdditionalBuilderAttempts: 1,
};
const acceptance = {
  id: 'rework-plan-acceptance-0001', reworkPlanId: record.id,
  reworkPlanRecordDigest: record.recordDigest, acceptanceDigest: 'e'.repeat(64), decision: 'accepted',
};
const builder = {
  id: 'work-order-0001', role: 'builder', acceptanceCriterionRefs: [],
  createdAt: '2026-07-29T00:00:00.000Z', executionPlanId: 'execution-plan-0001',
};
const request = getBuilderReworkPreflightRequest(record, acceptance, { workOrders: [builder] }, {
  rationale: ' Run the exact bounded no-write preflight. ',
  reviewedAt: '2026-07-29T00:00:00.000Z',
});
assert.deepEqual(Object.keys(request), [
  'reworkPlanAcceptanceId', 'reworkPlanRecordDigest', 'acceptanceDigest',
  'sourceExecutionPlanDigest', 'sourceAttemptRecordDigest', 'sourceProgressDigest',
  'builderWorkOrderId', 'builderWorkOrderDigest', 'reworkAttemptNumber',
  'workOrderAttemptNumber', 'evaluatedAt', 'dispatchApproval',
]);
assert.equal(request.dispatchApproval.rationale, 'Run the exact bounded no-write preflight.');
assert.equal(getBuilderReworkPreflightRequest(record, acceptance, { workOrders: [] }, {
  rationale: 'x', reviewedAt: '2026-07-29T00:00:00.000Z',
}), null);

const handlerStart = app.indexOf('async function submitBuilderReworkPreflight');
const handlerEnd = app.indexOf('\nfunction findRoleSourceDigest', handlerStart);
const submitHandler = app.slice(handlerStart, handlerEnd);
assert.ok(handlerStart >= 0 && handlerEnd > handlerStart);
assert.match(submitHandler, /state\.builderReworkDispatch = null;/);
assert.ok(
  submitHandler.indexOf('state.builderReworkDispatch = null;') <
    submitHandler.indexOf('await postJson'),
  'stale dispatch evidence must clear before recomputation',
);
assert.match(
  app,
  /if \(builderReworkPreflightForm\) \{[\s\S]*state\.builderReworkDispatch = null;/,
);

process.stdout.write(`${JSON.stringify({ ok: true, mode: 'ui-slice-706', command: 'exact-gated', dispatch: 'read-only evidence', downstreamControls: 'absent' }, null, 2)}\n`);
