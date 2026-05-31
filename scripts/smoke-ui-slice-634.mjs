import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');

const baselineDoc = fs.readFileSync(docPath, 'utf8');

assert.match(baselineDoc, /### Recorded host-ready proof snapshot/);
assert.match(
  baselineDoc,
  /Recorded before this documentation update on clean\/published `main@79890bc36838613520b8dace0d4d6ab0d68ae7f9`/,
);
assert.match(baselineDoc, /This is historical host-ready evidence, not a moving current-host claim/);
assert.match(
  baselineDoc,
  /Current host readiness must\s+be read by rerunning `markitdown --version`, `node scripts\/harness-run\.mjs doctor`, and\s+`node scripts\/harness_verification_status\.mjs` on the current head/,
);
assert.match(baselineDoc, /`markitdown --version`: `markitdown 0\.1\.5`/);
assert.match(baselineDoc, /`node scripts\/harness-run\.mjs doctor` reported `currentHostState: runnable`/);
assert.match(baselineDoc, /`node scripts\/harness_verification_status\.mjs` passed `46\/46` synthetic harness checks/);
assert.doesNotMatch(baselineDoc, /### Current host-ready proof\n/);

assert.match(baselineDoc, /### `scripts\/harness_verification_status\.mjs`/);
assert.match(baselineDoc, /smoke slices `01` through `04` and `06` through `46`/);
assert.match(
  baselineDoc,
  /`scripts\/smoke-harness-slice-05\.mjs` as the out-of-bundle aggregate self-check that pins the current 46-check id order/,
);
assert.match(baselineDoc, /46 required checks/);
assert.match(baselineDoc, /rejects unexpected CLI arguments with `error=invalid-arguments` and exit 2/);
assert.match(baselineDoc, /`node scripts\/smoke-harness-slice-43\.mjs`/);
assert.match(baselineDoc, /`node scripts\/smoke-harness-slice-44\.mjs`/);
assert.match(baselineDoc, /`node scripts\/smoke-harness-slice-45\.mjs`/);
assert.match(baselineDoc, /`node scripts\/smoke-harness-slice-46\.mjs`/);
assert.match(baselineDoc, /`node scripts\/ui_qa_status\.mjs`/);
assert.match(baselineDoc, /`node scripts\/smoke-ui-slice-633\.mjs`/);
assert.match(baselineDoc, /`node scripts\/smoke-ui-slice-634\.mjs`/);
assert.match(baselineDoc, /`node scripts\/smoke-ui-slice-635\.mjs`/);
assert.match(baselineDoc, /`node scripts\/smoke-ui-slice-636\.mjs`/);
assert.doesNotMatch(baselineDoc, /smoke slices `01` through `04`, `06`, `07`/);
assert.doesNotMatch(baselineDoc, /and `37`\n- reports one synthetic harness status payload/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessBaselineVerificationDoc: {
        document: 'docs/13_harness-baseline.md',
        harnessAggregateChecks: 46,
        aggregateSelfCheck: 'scripts/smoke-harness-slice-05.mjs',
        uiQaAggregateSelfCheck: 'scripts/smoke-ui-slice-633.mjs',
        verificationDocSelfCheck: 'scripts/smoke-ui-slice-634.mjs',
        readinessDocSelfCheck: 'scripts/smoke-ui-slice-635.mjs',
        missionCouncilDocSelfCheck: 'scripts/smoke-ui-slice-636.mjs',
      },
    },
    null,
    2,
  ),
);
