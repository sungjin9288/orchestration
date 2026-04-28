import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const docPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');
const statusScript = path.join(repoRoot, 'scripts', 'harness-status.mjs');

const expectedExternalReferenceIds = [
  'markitdown',
  'mempalace',
  'hermes-agent',
  'free-code',
  'CL4R1T4S',
  'andrej-karpathy-skills',
  'openscreen',
  'rtk',
  'free-claude-code',
];
const doc = fs.readFileSync(docPath, 'utf8');

for (const referenceId of expectedExternalReferenceIds) {
  assert.match(doc, new RegExp(referenceId.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')), `${referenceId} missing from harness baseline`);
}

const statusResult = spawnSync(process.execPath, [statusScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(statusResult.status, 0, `harness-status failed: ${statusResult.stderr}`);

const payload = JSON.parse(statusResult.stdout);
const statusIds = payload.harnesses.map((harness) => harness.id);
assert.deepEqual(statusIds, expectedExternalReferenceIds);
assert.equal(payload.counts.total, expectedExternalReferenceIds.length);
assert.equal(payload.counts.byPosture['approved-now'], 1);
assert.equal(payload.counts.byPosture['future-post-v1'], 2);
assert.equal(payload.counts.byPosture['signal-only'], 6);

const cl4r1t4s = payload.harnesses.find((harness) => harness.id === 'CL4R1T4S');
assert.ok(cl4r1t4s, 'CL4R1T4S status entry missing');
assert.equal(cl4r1t4s.state, 'policy-blocked');
assert.equal(cl4r1t4s.executable, false);
assert.equal(cl4r1t4s.runner, null);
assert.match(cl4r1t4s.note, /Do not import prompt-leak/);

const rtk = payload.harnesses.find((harness) => harness.id === 'rtk');
assert.ok(rtk, 'rtk status entry missing');
assert.equal(rtk.state, 'policy-blocked');
assert.equal(rtk.executable, false);
assert.match(rtk.note, /Do not install hooks/);

console.log(
  JSON.stringify(
    {
      ok: true,
      externalReferenceInventory: {
        mode: payload.mode,
        harnessCount: payload.counts.total,
        signalOnlyCount: payload.counts.byPosture['signal-only'],
        cl4r1t4sState: cl4r1t4s.state,
        rtkState: rtk.state,
      },
    },
    null,
    2,
  ),
);
