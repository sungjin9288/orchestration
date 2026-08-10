import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getOpsAttemptDispositionRequest,
  isExactOpsAttemptDisposition,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const styles = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const server = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);

requireNoCliArgs(process.argv.slice(2), { mode: 'ui-slice-714' });

assert.match(server, /OPS_ATTEMPT_DISPOSITION_BODY_KEYS/);
assert.match(server, /body requires exactly eleven fields/);
assert.match(server, /runtime\.quarantineOpsAttempt/);
assert.match(server, /runtime\.getOpsAttemptDisposition/);
assert.match(app, /async function quarantineOpsAttempt/);
assert.match(app, /data-action="quarantine-ops-attempt"/);
assert.match(app, /name="opsAttemptQuarantineAcknowledgement"/);
assert.match(app, /Quarantine without settlement or recovery/);
assert.match(app, /Quarantine uncertain attempt/);
assert.match(app, /data-ops-attempt-disposition-id/);
assert.match(app, /Quarantined attempt/);
assert.match(app, /settlement denied/);
assert.match(
  app,
  /\/api\/ops\/attempt-dispositions\/\$\{encodeURIComponent\(/,
);
assert.match(styles, /\.ops-attempt-quarantine-acknowledgement/);
assert.match(styles, /\.ops-attempt-quarantine-action/);
assert.match(styles, /\.ops-attempt-disposition/);
assert.match(styles, /max-width: 100%/);

const preview = {
  id: 'ops-supervision-preview-aaaaaaaaaaaaaaaa',
  persisted: false,
  status: 'supervision-required',
  targetType: 'work-order-attempt',
  targetId: 'work-order-attempt-0001',
  parentId: 'execution-plan-0001',
  targetRecordDigest: 'a'.repeat(64),
  parentDigest: 'b'.repeat(64),
  sourceDigest: 'c'.repeat(64),
  attemptNumber: 1,
  role: 'builder',
  startedAt: '2026-08-09T00:00:00.000Z',
  deadlineAt: null,
  evaluatedAt: '2026-08-09T00:00:01.000Z',
  previewDigest: 'd'.repeat(64),
};
const acknowledgement = 'quarantine-without-settlement-or-recovery';
const request = getOpsAttemptDispositionRequest(preview, acknowledgement);
assert.deepEqual(Object.keys(request), [
  'targetType',
  'targetId',
  'parentId',
  'expectedTargetRecordDigest',
  'expectedParentDigest',
  'evaluatedAt',
  'previewId',
  'previewDigest',
  'decision',
  'reasonCode',
  'acknowledgement',
]);
assert.equal(request.decision, 'quarantine');
assert.equal(
  request.reasonCode,
  'operator-uncertain-outcome-after-interruption',
);
assert.equal(
  getOpsAttemptDispositionRequest(preview, 'unsafe-acknowledgement'),
  null,
);
assert.equal(
  getOpsAttemptDispositionRequest(
    { ...preview, status: 'terminal' },
    acknowledgement,
  ),
  null,
);

const disposition = {
  id: 'ops-attempt-disposition-0001',
  targetType: preview.targetType,
  targetId: preview.targetId,
  parentId: preview.parentId,
  targetRecordDigest: preview.targetRecordDigest,
  parentDigest: preview.parentDigest,
  decision: 'quarantine',
  reasonCode: 'operator-uncertain-outcome-after-interruption',
  authoritySummary: {
    quarantineEvidenceAllowed: true,
    lateSettlementAllowed: false,
  },
};
assert.equal(isExactOpsAttemptDisposition(disposition, preview), true);
assert.equal(
  isExactOpsAttemptDisposition(
    { ...disposition, targetRecordDigest: 'e'.repeat(64) },
    preview,
  ),
  false,
);
assert.equal(
  isExactOpsAttemptDisposition(
    {
      ...disposition,
      authoritySummary: {
        quarantineEvidenceAllowed: true,
        lateSettlementAllowed: true,
      },
    },
    preview,
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
assert.doesNotMatch(
  renderSurface,
  /data-action="(?:cancel-attempt|resume-attempt|retry-attempt|settle-attempt|infer-success|infer-failure|run-provider|apply-result)"/,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'ui-slice-714',
      action: 'quarantine-exact-active-attempt',
      transport: 'bounded-eleven-key-post-and-exact-id-get',
      hydration: 'exact-disposition-locator-only',
      downstreamControls: 'absent',
      responsive: 'desktop-mobile-bounded',
    },
    null,
    2,
  )}\n`,
);
