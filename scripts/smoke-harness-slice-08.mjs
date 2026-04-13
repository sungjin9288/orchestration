#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');

const result = spawnSync(process.execPath, [runScript, 'doctor'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `harness doctor failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);
assert.equal(payload.mode, 'harness-run-doctor');
assert.equal(payload.ok, true);
assert.equal(payload.counts.total, 4);

const markitdown = payload.harnesses.find((harness) => harness.id === 'markitdown');
const mempalace = payload.harnesses.find((harness) => harness.id === 'mempalace');
const hermes = payload.harnesses.find((harness) => harness.id === 'hermes-agent');

assert.ok(markitdown, 'markitdown doctor entry missing');
assert.ok(mempalace, 'mempalace doctor entry missing');
assert.ok(hermes, 'hermes doctor entry missing');

assert.equal(markitdown.executable, true);
assert.ok(['ready', 'install-required'].includes(markitdown.state));
assert.equal(markitdown.available ? markitdown.state : 'install-required', markitdown.state);
assert.equal(mempalace.state, 'deferred');
assert.equal(hermes.state, 'policy-blocked');

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      checkedHarnesses: ['markitdown', 'mempalace', 'hermes-agent'],
    },
    null,
    2,
  ),
);
