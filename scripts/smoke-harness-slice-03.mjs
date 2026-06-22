#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');
const registryScript = path.join(repoRoot, 'scripts', 'harness-status.mjs');

const statusResult = spawnSync(process.execPath, [registryScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(statusResult.status, 0, `harness-status failed: ${statusResult.stderr}`);

const statusPayload = JSON.parse(statusResult.stdout);
const markitdown = statusPayload.harnesses.find((harness) => harness.id === 'markitdown');
assert.ok(markitdown, 'markitdown harness missing');
assert.equal(markitdown.posture, 'approved-now');

for (const blockedHarnessId of [
  'mempalace',
  'hermes-agent',
  'free-code',
  'CL4R1T4S',
  'andrej-karpathy-skills',
  'openscreen',
  'rtk',
  'free-claude-code',
  'agentway-harness-books',
]) {
  const blockedResult = spawnSync(process.execPath, [runScript, blockedHarnessId], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(blockedResult.status, 2, `${blockedHarnessId} should be policy-blocked`);
  assert.match(blockedResult.stderr, /not executable in the current repo posture/i);
}

const unknownResult = spawnSync(process.execPath, [runScript, 'unknown-harness'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(unknownResult.status, 2, 'unknown harness should fail');
assert.match(unknownResult.stderr, /Unknown harness/i);

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      blockedHarnesses: [
        'mempalace',
        'hermes-agent',
        'free-code',
        'CL4R1T4S',
        'andrej-karpathy-skills',
        'openscreen',
        'rtk',
        'free-claude-code',
        'agentway-harness-books',
      ],
    },
    null,
    2,
  ),
);
