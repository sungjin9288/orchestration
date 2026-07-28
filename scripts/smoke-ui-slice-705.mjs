import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getReworkPlanAcceptanceRequest } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const signals = fs.readFileSync(path.join(repoRoot, 'ui', 'council-signals.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-705' });

for (const source of [app, signals, styles]) {
  assert.equal(source.includes('append-builder-work-order'), false, 'UI must not expose Builder append controls');
}
assert.match(signals, /export function getReworkPlanAcceptanceRequest/);
assert.match(app, /data-action="accept-reviewer-rework-plan"/);
assert.match(app, /data-form="accept-reviewer-rework-plan"/);
assert.match(app, /\/api\/rework-plans\/\$\{encodeURIComponent\(record.id\)\}\/accept/);
assert.match(app, /\/api\/rework-plans\/\$\{encodeURIComponent\(state.reviewerReworkPlan.id\)\}\/acceptance/);
assert.match(signals, /reworkPlanRecordDigest: record.recordDigest/);
assert.match(signals, /acknowledgement: 'accept-exact-rework-plan-without-execution'/);
assert.match(styles, /\.reviewer-rework-acceptance/);
assert.match(styles, /overflow-wrap: anywhere/);
assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.reviewer-rework-record-form[\s\S]*grid-template-columns: 1fr/);

const sourceRecord = {
  id: 'rework-plan-0001',
  persisted: true,
  status: 'review-required',
  recordDigest: 'a'.repeat(64),
  previewId: 'reviewer-rework-preview-0001',
  previewDigest: 'b'.repeat(64),
  sourceExecutionPlanDigest: 'c'.repeat(64),
  sourceAttemptRecordDigest: 'd'.repeat(64),
  sourceProgressDigest: 'e'.repeat(64),
};
const reviewedAt = '2026-07-28T00:00:00.000Z';
const request = getReworkPlanAcceptanceRequest(sourceRecord, {
  rationale: ' Accept this exact rework scope as evidence only. ',
  reviewedAt,
});
assert.deepEqual(Object.keys(request), [
  'reworkPlanRecordDigest',
  'previewId',
  'previewDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'sourceProgressDigest',
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);
assert.equal(request.rationale, 'Accept this exact rework scope as evidence only.');
assert.equal(
  getReworkPlanAcceptanceRequest(sourceRecord, {
    rationale: ' ',
    reviewedAt,
  }),
  null,
);
assert.equal(
  getReworkPlanAcceptanceRequest(
    { ...sourceRecord, status: 'accepted' },
    { rationale: 'Evidence only.', reviewedAt },
  ),
  null,
);

const handlerStart = app.indexOf('async function acceptReviewerReworkPlan');
const handlerEnd = app.indexOf('\nfunction findRoleSourceDigest', handlerStart);
const acceptHandler = app.slice(handlerStart, handlerEnd);
assert.ok(handlerStart >= 0 && handlerEnd > handlerStart);
assert.match(acceptHandler, /state\.reviewerReworkPlanAcceptance = null;/);
assert.ok(
  acceptHandler.indexOf('state.reviewerReworkPlanAcceptance = null;') <
    acceptHandler.indexOf('await postJson'),
  'stale browser-memory success must clear before the request',
);

process.stdout.write(`${JSON.stringify({ ok: true, mode: 'ui-slice-705', action: 'exact-accept-only', hydration: 'exact-get', downstreamControls: 'absent', responsive: true }, null, 2)}\n`);
