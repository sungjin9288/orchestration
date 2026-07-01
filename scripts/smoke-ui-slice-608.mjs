import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function formatHarnessOutputBriefForCopy\(outputBrief, execution\)/);
assert.match(appJs, /getHarnessExecutionBriefCopyTitle\(execution\)/);
assert.match(appJs, /중요도: fail/);
assert.match(appJs, /처리 방식:/);
assert.match(appJs, /data-action="copy-harness-output-brief"/);
assert.match(
  appJs,
  /data-output-brief-text="\$\{escapeHtml\(formatHarnessOutputBriefForCopy\(getHarnessOutputBriefResult\(visibleHarnessExecutionResult, state\.lastHarnessOutputBriefResult\), visibleHarnessExecutionResult\)\)\}"/,
);
assert.match(appJs, /data-output-brief-label="\$\{escapeHtml\(getHarnessExecutionBriefCopyStatusLabel\(visibleHarnessExecutionResult\)\)\}"/);
assert.match(appJs, /data-harness-output-brief-copy="true"/);
assert.match(appJs, /async function copyHarnessOutputBrief\(briefText, label = '출력 요약'\)/);
assert.match(appJs, /actionButton\.dataset\.outputBriefLabel/);
assert.match(appJs, /getHarnessExecutionBriefCopyActionLabel\(visibleHarnessExecutionResult\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessOutputBriefCopy: {
        action: 'copy-harness-output-brief',
        source: 'latest-result output brief',
        labelSource: 'getHarnessExecutionBriefCopyStatusLabel',
      },
    },
    null,
    2,
  ),
);
