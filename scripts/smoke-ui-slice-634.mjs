import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');

const baselineDoc = fs.readFileSync(docPath, 'utf8');

assert.match(baselineDoc, /### `scripts\/harness_verification_status\.mjs`/);
assert.match(baselineDoc, /smoke slices `01` through `04` and `06` through `44`/);
assert.match(
  baselineDoc,
  /`scripts\/smoke-harness-slice-05\.mjs` as the out-of-bundle aggregate self-check/,
);
assert.match(baselineDoc, /44 required checks/);
assert.match(baselineDoc, /`node scripts\/smoke-harness-slice-43\.mjs`/);
assert.match(baselineDoc, /`node scripts\/smoke-harness-slice-44\.mjs`/);
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
        harnessAggregateChecks: 44,
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
