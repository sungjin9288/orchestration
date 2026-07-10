import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const statusScript = path.join(
  repoRoot,
  'scripts',
  'growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs',
);

function runStatus(args = []) {
  const result = spawnSync(process.execPath, [statusScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 60 * 1024 * 1024,
  });
  const stdout = result.stdout?.trim() || '';
  const stderr = result.stderr?.trim() || '';
  let payload = null;

  try {
    payload = JSON.parse(stdout || stderr);
  } catch (_error) {
    payload = null;
  }

  return {
    status: result.status,
    stdout,
    stderr,
    payload,
  };
}

const source = fs.readFileSync(statusScript, 'utf8');
assert.match(source, /proposalRecordLifecycleReviewCandidate/);
assert.match(source, /lifecycleSegmentCount < 2/);
assert.match(source, /sourceCandidate/);
assert.doesNotMatch(source, /writeFileSync|appendFileSync|rmSync|mkdirSync|renameSync/);

const result = runStatus();
assert.equal(result.status, 0, result.stderr);
assert.equal(result.payload.ok, true);
assert.equal(result.payload.mode, 'growth-evidence-ledger-proposal-record-lifecycle-review-status');
assert.equal(result.payload.readiness.lifecycleReviewOnly, true);
assert.equal(result.payload.inputStatuses.growthEngineStatus.nextEngineSlice, 'growth-evidence-ledger-proposal-record-lifecycle-review');
assert.equal(
  result.payload.inputStatuses.growthReflectionEvaluator.nextRecommendedSlice,
  'growth-evidence-ledger-proposal-record-lifecycle-review',
);
assert.match(
  result.payload.inputStatuses.growthReflectionEvaluator.sourceCandidate,
  /review-acceptance-finalization/,
);
assert.deepEqual(
  result.payload.lifecycleReview.findings.map((finding) => [finding.id, finding.ok]),
  [
    ['engine-routes-to-short-lifecycle-review', true],
    ['reflection-routes-to-short-lifecycle-review', true],
    ['source-candidate-preserves-long-route-evidence', true],
    ['reflection-finding-is-review-not-authority', true],
  ],
);
assert.equal(result.payload.safetyBoundary.readOnly, true);
assert.equal(result.payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(result.payload.safetyBoundary.doesNotCallProviders, true);
assert.equal(result.payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(result.payload.safetyBoundary.doesNotCreateProposalRecordsOutsideApprovedRuntime, true);
assert.equal(result.payload.safetyBoundary.doesNotMutateSourceOutsideApprovedRuntime, true);
assert.equal(result.payload.safetyBoundary.doesNotCommit, true);
assert.equal(result.payload.safetyBoundary.doesNotPush, true);

const invalidArgs = runStatus(['--write']);
assert.equal(invalidArgs.status, 2);
assert.equal(invalidArgs.payload.ok, false);
assert.equal(invalidArgs.payload.error, 'invalid-arguments');

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'smoke-growth-evidence-ledger-proposal-record-lifecycle-review-status',
      nextRecommendedSlice: result.payload.nextRecommendedSlice.id,
      sourceCandidate: result.payload.inputStatuses.growthReflectionEvaluator.sourceCandidate,
      readOnly: result.payload.safetyBoundary.readOnly,
    },
    null,
    2,
  )}\n`,
);
