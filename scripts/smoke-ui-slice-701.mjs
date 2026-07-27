import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getSpecialistCellRetryEligibility,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ui-slice-701-specialist-cell-retry-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const styleSource = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const serverSource = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);
const runtimeSource = fs.readFileSync(
  path.join(repoRoot, 'src', 'runtime', 'runtime-service.js'),
  'utf8',
);
const panelStart = appSource.indexOf('function renderSpecialistBatchPreview');
const panelEnd = appSource.indexOf(
  'function renderMissionWorkOrderCompileForm',
  panelStart,
);
assert.ok(panelStart >= 0 && panelEnd > panelStart);
const panelSource = appSource.slice(panelStart, panelEnd);

const batch = {
  id: 'specialist-batch-0001',
  status: 'partial-failed',
  sourceDigest: 'a'.repeat(64),
};
const attempts = [
  {
    id: 'specialist-cell-attempt-0001',
    attemptNumber: 1,
    role: 'researcher',
    status: 'completed',
  },
  {
    id: 'specialist-cell-attempt-0002',
    attemptNumber: 1,
    role: 'qa',
    status: 'failed',
  },
];
const previewSummary = { sourceDigest: batch.sourceDigest };
const eligible = getSpecialistCellRetryEligibility(
  batch,
  attempts,
  [],
  previewSummary,
);
assert.deepEqual(
  eligible.map((entry) => [entry.attempt.role, entry.eligible]),
  [
    ['researcher', false],
    ['qa', true],
  ],
);
const activeRetry = {
  specialistCellRetry: {
    id: 'specialist-cell-retry-0001',
    sourceCellAttemptId: attempts[1].id,
    status: 'active',
  },
  specialistCellAttempt: {
    id: 'specialist-cell-attempt-0003',
    attemptNumber: 2,
    role: 'qa',
    status: 'active',
  },
};
assert.equal(
  getSpecialistCellRetryEligibility(
    batch,
    attempts,
    [activeRetry],
    previewSummary,
  ).some((entry) => entry.eligible),
  false,
);
assert.equal(
  getSpecialistCellRetryEligibility(
    batch,
    attempts,
    [],
    { sourceDigest: 'b'.repeat(64) },
  ).some((entry) => entry.eligible),
  false,
);

assert.match(appSource, /retryDeadlineMs:\s*30000/);
assert.match(appSource, /data-action="retry-specialist-cell"/);
assert.match(appSource, /Retry failed cell/);
assert.match(appSource, /retry-failed-cell-once/);
assert.match(
  appSource,
  /retain-original-evidence-and-retry-exact-failed-cell-once/,
);
assert.match(appSource, /Recompute retry contract/);
assert.match(
  appSource,
  /sourceCellAttemptId:\s*sourceCellAttempt\.id/,
);
assert.match(
  appSource,
  /expectedBatchRecordDigest:\s*batch\.recordDigest/,
);
assert.match(
  appSource,
  /expectedSourceCellAttemptRecordDigest:\s*[\s\S]*sourceCellAttempt\.recordDigest/,
);
assert.match(
  appSource,
  /\/api\/specialist-batches\/\$\{encodeURIComponent\([\s\S]*\/cell-retries/,
);
assert.match(
  appSource,
  /\/cell-retry\?\$\{locator\}/,
);
assert.doesNotMatch(
  panelSource,
  /data-action="(?:cancel|resume|retry-all|apply|schedule|provider)[^"]*"/,
);
assert.doesNotMatch(
  appSource,
  /localStorage\.(?:setItem|getItem)\([^)]*specialistCellRetry/,
);

assert.match(serverSource, /specialistCellRetryStartMatch/);
assert.match(serverSource, /runtime\.retrySpecialistBatchCell\(/);
assert.match(serverSource, /runtime\.getSpecialistCellRetry\(/);
assert.match(serverSource, /runtime\.getSpecialistBatchCellRetry\(/);
assert.match(serverSource, /queryKeys\.length !== 1/);
assert.match(
  serverSource,
  /error\.specialistCellRetryId && error\.retryCellAttemptId/,
);
assert.match(runtimeSource, /retrySpecialistBatchCell/);
assert.match(runtimeSource, /getSpecialistBatchCellRetry/);
assert.match(runtimeSource, /getSpecialistCellRetry/);
assert.match(
  runtimeSource,
  /delete snapshotForPublicProjection\.specialistCellRetries/,
);

assert.match(
  styleSource,
  /\.specialist-retry-approval\s*\{[\s\S]*grid-template-columns: minmax\(160px, 220px\) minmax\(280px, 1fr\)/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.specialist-retry-approval\s*\{[\s\S]*grid-template-columns: 1fr/,
);
assert.match(
  styleSource,
  /\.specialist-retry-command\s*\{[\s\S]*min-width: 0/,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      authority: {
        exactFailedCellOnly: true,
        retryAllControls: false,
        recoveryOrCancelControls: false,
        providerOrApplicationControls: false,
      },
      durability: {
        exactSourceLocator: true,
        originalAndRetryEvidenceSeparated: true,
        genericSnapshotMaps: false,
      },
      responsive: {
        desktopApprovalColumns: 2,
        mobileApprovalColumns: 1,
      },
    },
    null,
    2,
  )}\n`,
);
