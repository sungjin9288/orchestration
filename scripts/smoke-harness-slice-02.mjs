#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const docPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');
const scriptPath = path.join(repoRoot, 'scripts', 'harness-status.mjs');

assert.ok(fs.existsSync(docPath), 'docs/13_harness-baseline.md missing');
assert.ok(fs.existsSync(scriptPath), 'scripts/harness-status.mjs missing');

const doc = fs.readFileSync(docPath, 'utf8');
assert.match(doc, /harness-status\.mjs/);
assert.match(doc, /approved-now/i);
assert.match(doc, /future-post-v1/i);
assert.match(doc, /signal-only/i);

const result = spawnSync(process.execPath, [scriptPath], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `harness-status failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);
assert.equal(payload.mode, 'harness-status');
assert.equal(payload.ok, true);

const ids = payload.harnesses.map((harness) => harness.id);
assert.deepEqual(ids, ['markitdown', 'mempalace', 'hermes-agent', 'free-code']);

const postures = Object.fromEntries(payload.harnesses.map((harness) => [harness.id, harness.posture]));
assert.equal(postures.markitdown, 'approved-now');
assert.equal(postures.mempalace, 'future-post-v1');
assert.equal(postures['hermes-agent'], 'signal-only');
assert.equal(postures['free-code'], 'signal-only');

console.log(
  JSON.stringify(
    {
      ok: true,
      docPath,
      scriptPath,
      harnessCount: payload.harnesses.length,
    },
    null,
    2,
  ),
);
