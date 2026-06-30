import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runnerScript = 'scripts/run-smoke.mjs';

function runRunner(args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [runnerScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
  return JSON.parse(expectedStatus === 0 ? result.stdout : result.stderr);
}

function countSmokeScripts() {
  return fs
    .readdirSync(path.join(repoRoot, 'scripts'))
    .filter((name) => /^smoke-.*\.mjs$/.test(name)).length;
}

const smokeFileCount = countSmokeScripts();
const listResult = runRunner(['--list']);
assert.equal(listResult.ok, true);
assert.equal(listResult.mode, 'smoke-runner-list');
assert.equal(listResult.count, smokeFileCount);
assert.ok(listResult.scripts.includes('scripts/smoke-readme-scope-evidence.mjs'));

const dryRunResult = runRunner(['--filter', 'smoke-readme-scope-evidence', '--dry-run']);
assert.equal(dryRunResult.ok, true);
assert.equal(dryRunResult.mode, 'smoke-runner-dry-run');
assert.deepEqual(dryRunResult.scripts, ['scripts/smoke-readme-scope-evidence.mjs']);

const targetedRunResult = runRunner([
  '--filter',
  'smoke-readme-scope-evidence',
  '--timeout-ms',
  '120000',
]);
assert.equal(targetedRunResult.ok, true);
assert.equal(targetedRunResult.mode, 'smoke-runner');
assert.equal(targetedRunResult.counts.matched, 1);
assert.equal(targetedRunResult.counts.executed, 1);
assert.equal(targetedRunResult.counts.failed, 0);

const noSelectionResult = runRunner([], 2);
assert.equal(noSelectionResult.ok, false);
assert.equal(noSelectionResult.mode, 'smoke-runner-error');
assert.match(noSelectionResult.message, /Pass --filter <text>/);

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'smoke-runner-status',
      smokeFileCount,
      targetedScript: 'scripts/smoke-readme-scope-evidence.mjs',
    },
    null,
    2,
  ),
);
