import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const statusScript = path.join(repoRoot, 'scripts', 'growth-reflection-loop-automation-boundary-status.mjs');

function runStatus(args = []) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'growth-loop-boundary-smoke-'));
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
assert.equal(result.status, 0, `growth-reflection-loop-automation-boundary-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-reflection-loop-automation-boundary-status');
assert.equal(payload.posture, 'local-read-only-growth-reflection-boundary-rule');
assert.equal(payload.schemaVersion, 'growth-reflection-loop-automation-boundary-status/v0');
assert.equal(payload.rule.id, 'loop-automation-boundary-gap');
assert.match(payload.rule.trigger, /loop automation/);
assert.equal(payload.rule.flagWhen, 'claimsLoopAutomation is true and any required boundary is absent');
assert.equal(payload.rule.severity, 'blocking');
assert.equal(payload.rule.outputOnly, true);

assert.deepEqual(
  payload.rule.requiredBoundaries.map((boundary) => boundary.id),
  ['budget', 'retry', 'rollback', 'approval'],
);

const complete = payload.sampleEvaluations.find(
  (evaluation) => evaluation.id === 'complete-loop-automation-boundaries',
);
assert.equal(complete.claimsLoopAutomation, true);
assert.equal(complete.flagged, false);
assert.deepEqual(complete.missingBoundaries, []);
for (const boundary of complete.boundaryChecks) {
  assert.equal(boundary.present, true, `${boundary.id} should be present in complete sample`);
}

const missingAll = payload.sampleEvaluations.find((evaluation) => evaluation.id === 'missing-all-boundaries');
assert.equal(missingAll.claimsLoopAutomation, true);
assert.equal(missingAll.flagged, true);
assert.equal(missingAll.severity, 'blocking');
assert.equal(missingAll.classification, 'loop-automation-boundary-gap');
assert.deepEqual(missingAll.missingBoundaries, ['budget', 'retry', 'rollback', 'approval']);
assert.match(missingAll.allowedAction, /read-only growth reflection finding/);
assert.match(missingAll.allowedAction, /do not generate, apply, schedule, or execute/);

const nonLoop = payload.sampleEvaluations.find((evaluation) => evaluation.id === 'non-loop-copy-slice');
assert.equal(nonLoop.claimsLoopAutomation, false);
assert.equal(nonLoop.flagged, false);
assert.deepEqual(nonLoop.missingBoundaries, []);

for (const [alignment, passed] of Object.entries(payload.sourceAlignment)) {
  assert.equal(passed, true, `${alignment} should pass`);
}
assert.deepEqual(payload.failedAlignment, []);

assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.mutatesRuntime, false);
assert.equal(payload.safetyBoundary.generatesProposal, false);
assert.equal(payload.safetyBoundary.appliesProposal, false);
assert.equal(payload.safetyBoundary.schedulesWork, false);
assert.equal(payload.safetyBoundary.runsProviderCalls, false);
assert.equal(payload.safetyBoundary.persistsMemory, false);
assert.equal(payload.safetyBoundary.opensConnectors, false);
assert.equal(payload.safetyBoundary.createsCommits, false);
assert.equal(payload.safetyBoundary.createsPushes, false);

for (const blocked of [
  /proposal generation/,
  /proposal application/,
  /unattended scheduled execution/,
  /background worker execution/,
  /runtime mutation/,
  /provider calls/,
  /persistent memory writes/,
  /connector or external notification dispatch/,
  /automatic commit, push, merge, or release/,
]) {
  assert.ok(payload.notAuthorized.some((entry) => blocked.test(entry)), `missing blocked action: ${blocked}`);
}

assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-reflection-evaluator-boundary-finding-integration',
);
assert.equal(payload.nextRecommendedSlice.status, 'candidate-not-approved');

const invalidResult = runStatus(['--apply']);
assert.equal(invalidResult.status, 2);
assert.equal(invalidResult.payload?.ok, false);
assert.equal(invalidResult.payload?.mode, 'growth-reflection-loop-automation-boundary-status');
assert.equal(invalidResult.payload?.error, 'invalid-arguments');
assert.deepEqual(invalidResult.payload?.allowedFlags, []);
assert.deepEqual(invalidResult.payload?.receivedArgs, ['--apply']);

const conceptReview = fs.readFileSync(
  path.join(repoRoot, 'docs', '20_loop-engineering-concept-review.md'),
  'utf8',
);
const verificationStatus = fs.readFileSync(path.join(repoRoot, 'scripts', 'verification_status.mjs'), 'utf8');

assert.match(
  conceptReview,
  /Implemented Growth Reflection Rule Slice: `growth-reflection-loop-automation-boundary-status`/,
);
assert.match(conceptReview, /node scripts\/growth-reflection-loop-automation-boundary-status\.mjs/);
assert.match(verificationStatus, /smoke-growth-reflection-loop-automation-boundary-status\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      command: 'node scripts/growth-reflection-loop-automation-boundary-status.mjs',
      requiredBoundaries: payload.rule.requiredBoundaries.map((boundary) => boundary.id),
      flaggedSamples: payload.sampleEvaluations.filter((evaluation) => evaluation.flagged).length,
    },
    null,
    2,
  ),
);
