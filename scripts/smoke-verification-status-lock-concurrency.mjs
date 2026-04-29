import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const concurrentChecks = [
  {
    id: 'verification-status-a',
    args: ['scripts/verification_status.mjs'],
    mode: 'synthetic-verification-status',
  },
  {
    id: 'verification-status-b',
    args: ['scripts/verification_status.mjs'],
    mode: 'synthetic-verification-status',
  },
  {
    id: 'operator-status',
    args: ['scripts/v1-operator-status.mjs'],
    mode: 'v1-operator-status',
  },
];
const childTimeoutMs = 180_000;

function runNodeCheck(check) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, check.args, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
    }, childTimeoutMs);
    child.on('close', (status, signal) => {
      clearTimeout(timeout);
      let parsed = null;
      try {
        parsed = JSON.parse(stdout);
      } catch (_error) {
        parsed = null;
      }
      resolve({
        ...check,
        ok: status === 0 && parsed?.ok === true,
        parsed,
        signal,
        status,
        stderr: stderr.trim(),
        stdout: stdout.trim(),
        timedOut: signal === 'SIGTERM',
      });
    });
  });
}

const results = await Promise.all(concurrentChecks.map(runNodeCheck));

for (const result of results) {
  assert.equal(
    result.ok,
    true,
    `${result.id} should pass while verification status lock serializes child checks: ${JSON.stringify({
      signal: result.signal,
      status: result.status,
      stderr: result.stderr,
      stdout: result.stdout.slice(0, 500),
      timedOut: result.timedOut,
    })}`,
  );
  assert.equal(result.parsed?.mode, result.mode);

  if (result.mode === 'synthetic-verification-status') {
    assert.equal(result.parsed?.concurrency?.serialized, true);
    assert.equal(result.parsed?.failures?.length, 0);
  }

  if (result.mode === 'v1-operator-status') {
    assert.equal(result.parsed?.verification?.ok, true);
    assert.equal(result.parsed?.safetyBoundary?.readOnly, true);
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'verification-status-lock-concurrency-smoke',
      note: 'standalone only; do not add this recursive concurrency smoke to scripts/verification_status.mjs',
      results: results.map((result) => ({
        id: result.id,
        mode: result.mode,
        status: result.status,
      })),
    },
    null,
    2,
  ),
);
