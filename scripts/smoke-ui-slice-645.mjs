import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const summaryPath = path.join(repoRoot, 'scripts', 'ui_qa_summary.mjs');
const summarySource = fs.readFileSync(summaryPath, 'utf8');

assert.match(summarySource, /requireNoCliArgs\(process\.argv\.slice\(2\), \{ mode: 'manual-ui-qa-checklist' \}\)/);

const result = spawnSync(process.execPath, [summaryPath], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `ui QA summary failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);
assert.equal(payload.ok, true);
assert.equal(payload.mode, 'manual-ui-qa-checklist');
assert.equal(payload.browserAutomation, 'manual-required');
assert.equal(Array.isArray(payload.checklist), true);
assert.equal(payload.checklist.length, 7);
assert.deepEqual(
  payload.checklist.map((item) => item.id),
  [
    'mission-blocked-gate',
    'council-transition',
    'deliverables-to-ops-entry',
    'taskboard-first-zone',
    'logs-first-zone',
    'artifacts-first-zone',
    'decision-first-zone',
  ],
);

const typoResult = spawnSync(process.execPath, [summaryPath, '--typo'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(typoResult.status, 2);
assert.equal(typoResult.stdout, '');

const typoPayload = JSON.parse(typoResult.stderr);
assert.equal(typoPayload.ok, false);
assert.equal(typoPayload.mode, 'manual-ui-qa-checklist');
assert.equal(typoPayload.error, 'invalid-arguments');
assert.deepEqual(typoPayload.allowedFlags, []);
assert.deepEqual(typoPayload.receivedArgs, ['--typo']);

console.log(
  JSON.stringify(
    {
      ok: true,
      manualUiQaChecklist: {
        mode: payload.mode,
        checklistCount: payload.checklist.length,
        typoRejected: true,
      },
    },
    null,
    2,
  ),
);
