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
assert.equal(payload.counts.total, 9);

const markitdown = payload.harnesses.find((harness) => harness.id === 'markitdown');
const mempalace = payload.harnesses.find((harness) => harness.id === 'mempalace');
const hermes = payload.harnesses.find((harness) => harness.id === 'hermes-agent');
const cl4r1t4s = payload.harnesses.find((harness) => harness.id === 'CL4R1T4S');
const andrej = payload.harnesses.find((harness) => harness.id === 'andrej-karpathy-skills');
const openscreen = payload.harnesses.find((harness) => harness.id === 'openscreen');
const rtk = payload.harnesses.find((harness) => harness.id === 'rtk');

assert.ok(markitdown, 'markitdown doctor entry missing');
assert.ok(mempalace, 'mempalace doctor entry missing');
assert.ok(cl4r1t4s, 'CL4R1T4S doctor entry missing');
assert.ok(hermes, 'hermes doctor entry missing');
assert.ok(andrej, 'andrej-karpathy-skills doctor entry missing');
assert.ok(openscreen, 'openscreen doctor entry missing');
assert.ok(rtk, 'rtk doctor entry missing');

assert.equal(markitdown.executable, true);
assert.ok(['ready', 'install-required'].includes(markitdown.state));
assert.equal(markitdown.available ? markitdown.state : 'install-required', markitdown.state);
assert.equal(mempalace.state, 'deferred');
assert.equal(cl4r1t4s.state, 'policy-blocked');
assert.equal(hermes.state, 'policy-blocked');
assert.equal(andrej.state, 'policy-blocked');
assert.equal(openscreen.state, 'deferred');
assert.equal(rtk.state, 'policy-blocked');

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      checkedHarnesses: ['markitdown', 'mempalace', 'hermes-agent', 'CL4R1T4S', 'andrej-karpathy-skills', 'openscreen', 'rtk'],
    },
    null,
    2,
  ),
);
