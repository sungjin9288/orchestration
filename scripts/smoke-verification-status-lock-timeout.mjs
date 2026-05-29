import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const lockPath = path.join(repoRoot, 'var', 'locks', 'verification_status.lock');
const ownerPath = path.join(lockPath, 'owner.json');

fs.rmSync(lockPath, { recursive: true, force: true });
fs.mkdirSync(lockPath, { recursive: true });
fs.writeFileSync(
  ownerPath,
  `${JSON.stringify(
    {
      test: 'smoke-verification-status-lock-timeout',
      pid: process.pid,
      startedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
);

try {
  const result = spawnSync(process.execPath, ['scripts/verification_status.mjs'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS: '1',
    },
  });

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');

  const payload = JSON.parse(result.stderr);

  assert.equal(payload.ok, false);
  assert.equal(payload.mode, 'synthetic-verification-status');
  assert.equal(payload.error, 'lock-timeout');
  assert.match(payload.message, /Timed out waiting for verification_status lock/);
  assert.equal(payload.lockPath, 'var/locks/verification_status.lock');
  assert.equal(payload.waitedMs, 1);
  assert.equal(payload.staleLockMs, 600000);
  assert.match(payload.guidance, /Another verification_status process may be active/);
} finally {
  fs.rmSync(lockPath, { recursive: true, force: true });
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'verification-status-lock-timeout-smoke',
      note: 'standalone only; do not add this recursive timeout smoke to scripts/verification_status.mjs',
    },
    null,
    2,
  ),
);
