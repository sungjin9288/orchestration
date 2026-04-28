import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');

const baselineDoc = fs.readFileSync(docPath, 'utf8');

assert.match(baselineDoc, /### Local-only execution preview brief/);
assert.match(baselineDoc, /mode-aware preview brief action/);
assert.match(
  baselineDoc,
  /policy-report packets show `리포트 요약`, while normal execution packets keep\s+`출력 요약`/,
);
assert.match(baselineDoc, /recent execution history rows expose the same mode-aware brief action/);
assert.match(baselineDoc, /hidden-result packets also expose the same mode-aware brief action/);
assert.match(baselineDoc, /policy-report packets show `리포트 요약 복사`, normal execution packets keep `요약 복사`/);
assert.doesNotMatch(
  baselineDoc,
  /`ui\/app\.js` adds `출력 요약` on the visible latest-result register/,
);
assert.doesNotMatch(baselineDoc, /recent execution history rows also expose `출력 요약`/);
assert.doesNotMatch(baselineDoc, /hidden-result packets also expose `출력 요약`/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessPreviewBriefDocModeLabels: {
        document: 'docs/13_harness-baseline.md',
        section: 'Local-only execution preview brief',
        labels: ['리포트 요약', '출력 요약', '리포트 요약 복사', '요약 복사'],
      },
    },
    null,
    2,
  ),
);
