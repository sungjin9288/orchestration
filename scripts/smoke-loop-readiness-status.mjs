import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const statusScript = path.join(repoRoot, 'scripts', 'loop-readiness-status.mjs');

function runStatus(args = []) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-readiness-status-smoke-'));
  const stdoutPath = path.join(tempDir, 'stdout.json');
  const stdoutFd = fs.openSync(stdoutPath, 'w');
  const result = spawnSync(process.execPath, [statusScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', stdoutFd, 'pipe'],
  });
  fs.closeSync(stdoutFd);
  const stdout = fs.existsSync(stdoutPath) ? fs.readFileSync(stdoutPath, 'utf8').trim() : '';
  fs.rmSync(tempDir, { force: true, recursive: true });
  const stderr = result.stderr?.trim() || '';
  let payload = null;

  try {
    payload = JSON.parse(stdout || stderr);
  } catch (_error) {
    payload = null;
  }

  return {
    payload,
    status: result.status,
    stderr,
    stdout,
  };
}

const result = runStatus();
assert.equal(result.status, 0, `loop-readiness-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'loop-readiness-status');
assert.equal(payload.posture, 'local-read-only-loop-readiness');
assert.equal(payload.schemaVersion, 'loop-readiness-status/v0');
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.mutatesRuntime, false);
assert.equal(payload.safetyBoundary.runsProviderCalls, false);
assert.equal(payload.safetyBoundary.createsCommits, false);
assert.equal(payload.safetyBoundary.createsPushes, false);
assert.equal(payload.safetyBoundary.persistsMemory, false);
assert.equal(payload.safetyBoundary.opensConnectors, false);
assert.equal(payload.safetyBoundary.schedulesWork, false);

assert.deepEqual(
  payload.loopSkeleton.map((stage) => stage.stage),
  ['discover', 'plan', 'execute', 'verify', 'iterate'],
);
assert.equal(payload.loopSkeleton.find((stage) => stage.stage === 'verify').status, 'required-control-point');
assert.equal(
  payload.loopSkeleton.find((stage) => stage.stage === 'iterate').status,
  'human-return-required',
);

const requiredCriteria = [
  'goal',
  'boundary',
  'verification-gate',
  'stop-condition',
  'human-return-point',
  'source-of-truth',
  'local-evidence',
];
assert.deepEqual(
  payload.criteriaChecks.map((criterion) => criterion.id),
  requiredCriteria,
);
for (const criterion of payload.criteriaChecks) {
  assert.equal(criterion.passed, true, `${criterion.id} should pass`);
  assert.ok(criterion.evidenceRefs.length > 0, `${criterion.id} should name evidence refs`);
}
assert.deepEqual(payload.failedCriteria, []);

assert.deepEqual(payload.workItemReadinessTemplate.requiredFields, [
  'goal',
  'boundary',
  'verificationGate',
  'stopCondition',
  'humanReturnPoint',
  'sourceOfTruthRefs',
]);
assert.equal(payload.workItemReadinessTemplate.rejectIfMissingAnyRequiredField, true);
assert.match(payload.workItemReadinessTemplate.safeDefaultWhenIncomplete, /read-only status/);

for (const blocked of [
  /unattended scheduled execution/,
  /open-loop exploration/,
  /provider expansion/,
  /persistent memory store adoption/,
  /automatic pull request, push, merge, release, or external notification/,
  /new connector\/channel execution/,
]) {
  assert.ok(payload.notAuthorized.some((entry) => blocked.test(entry)), `missing blocked action: ${blocked}`);
}

assert.equal(payload.nextRecommendedSlice.id, 'mission-council-loop-stage-stop-condition-copy');
assert.equal(payload.nextRecommendedSlice.type, 'docs-ui-copy-only');
assert.equal(payload.nextRecommendedSlice.command, 'node scripts/loop-readiness-status.mjs');

const invalidResult = runStatus(['--apply']);
assert.equal(invalidResult.status, 2);
assert.equal(invalidResult.payload?.ok, false);
assert.equal(invalidResult.payload?.mode, 'loop-readiness-status');
assert.equal(invalidResult.payload?.error, 'invalid-arguments');
assert.deepEqual(invalidResult.payload?.allowedFlags, []);
assert.deepEqual(invalidResult.payload?.receivedArgs, ['--apply']);

const conceptReview = fs.readFileSync(
  path.join(repoRoot, 'docs', '20_loop-engineering-concept-review.md'),
  'utf8',
);
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const verificationStatus = fs.readFileSync(path.join(repoRoot, 'scripts', 'verification_status.mjs'), 'utf8');

assert.match(conceptReview, /Implemented Read-Only Slice: `loop-readiness-status`/);
assert.match(conceptReview, /node scripts\/loop-readiness-status\.mjs/);
assert.match(harnessBaseline, /node scripts\/loop-readiness-status\.mjs/);
assert.match(verificationStatus, /smoke-loop-readiness-status\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      command: 'node scripts/loop-readiness-status.mjs',
      checkedCriteria: requiredCriteria.length,
      blockedActions: payload.notAuthorized.length,
    },
    null,
    2,
  ),
);
