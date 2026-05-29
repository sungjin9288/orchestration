import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const uiQaStatusPath = path.join(repoRoot, 'scripts', 'ui_qa_status.mjs');

const uiQaStatus = fs.readFileSync(uiQaStatusPath, 'utf8');
const smokeCheckEntries = [...uiQaStatus.matchAll(/id:\s*'([^']+)',\s*\n\s*script:\s*'([^']+)'/g)].map(
  (match) => ({
    id: match[1],
    script: match[2],
  }),
);
const unknownArgResult = spawnSync(process.execPath, [uiQaStatusPath, '--typo'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
const unknownArgPayload = JSON.parse(unknownArgResult.stderr);

assert.equal(smokeCheckEntries.length, 24);
assert.deepEqual(
  smokeCheckEntries.slice(-15),
  [
    {
      id: 'harness-brief-mode-labels',
      script: 'scripts/smoke-ui-slice-628.mjs',
    },
    {
      id: 'harness-brief-copy-payload-title',
      script: 'scripts/smoke-ui-slice-630.mjs',
    },
    {
      id: 'harness-packet-brief-presence-label',
      script: 'scripts/smoke-ui-slice-631.mjs',
    },
    {
      id: 'harness-preview-brief-doc-mode-labels',
      script: 'scripts/smoke-ui-slice-632.mjs',
    },
    {
      id: 'harness-baseline-verification-doc-bundle',
      script: 'scripts/smoke-ui-slice-634.mjs',
    },
    {
      id: 'pre-real-readiness-ui-qa-status-doc',
      script: 'scripts/smoke-ui-slice-635.mjs',
    },
    {
      id: 'mission-council-slice-doc-status',
      script: 'scripts/smoke-ui-slice-636.mjs',
    },
    {
      id: 'workspace-click-outcome-guidance',
      script: 'scripts/smoke-ui-slice-637.mjs',
    },
    {
      id: 'deliverables-review-passed-result-routing',
      script: 'scripts/smoke-ui-slice-638.mjs',
    },
    {
      id: 'operator-home-runway',
      script: 'scripts/smoke-ui-slice-640.mjs',
    },
    {
      id: 'operator-home-no-mission-start-gate',
      script: 'scripts/smoke-ui-slice-641.mjs',
    },
    {
      id: 'operator-home-no-mission-handoff-label',
      script: 'scripts/smoke-ui-slice-642.mjs',
    },
    {
      id: 'workspace-playbook-no-mission-next-location',
      script: 'scripts/smoke-ui-slice-643.mjs',
    },
    {
      id: 'serve-ui-argument-guard',
      script: 'scripts/smoke-ui-slice-644.mjs',
    },
    {
      id: 'manual-ui-qa-summary-argument-guard',
      script: 'scripts/smoke-ui-slice-645.mjs',
    },
  ],
);
assert.match(uiQaStatus, /requireNoCliArgs\(process\.argv\.slice\(2\), \{ mode: 'synthetic-ui-qa' \}\)/);
assert.match(uiQaStatus, /browserAutomation:\s*'manual-required'/);
assert.match(uiQaStatus, /snapshot-reachability/);
assert.equal(unknownArgResult.status, 2);
assert.equal(unknownArgResult.stdout, '');
assert.equal(unknownArgPayload.ok, false);
assert.equal(unknownArgPayload.mode, 'synthetic-ui-qa');
assert.equal(unknownArgPayload.error, 'invalid-arguments');
assert.deepEqual(unknownArgPayload.allowedFlags, []);
assert.deepEqual(unknownArgPayload.receivedArgs, ['--typo']);

console.log(
  JSON.stringify(
    {
      ok: true,
      uiQaStatusRepresentativeCoverage: {
        requiredChecks: smokeCheckEntries.length,
        representativeChecks: smokeCheckEntries.slice(-15),
        informationalSnapshotReachability: true,
      },
    },
    null,
    2,
  ),
);
