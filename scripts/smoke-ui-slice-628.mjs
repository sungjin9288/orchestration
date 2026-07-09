import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const harnessLabelsPath = path.join(repoRoot, 'ui', 'harness-labels.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessLabels = fs.readFileSync(harnessLabelsPath, 'utf8');

assert.match(harnessLabels, /export function getHarnessExecutionBriefActionLabel\(execution\) \{/);
assert.match(harnessLabels, /briefAction:\s*\{\s*policyReport: '리포트 요약',\s*execution: '출력 요약',\s*\}/);
assert.match(harnessLabels, /return getHarnessExecutionLabel\(execution, 'briefAction'\);/);
assert.match(harnessLabels, /handoffs\.push\('미리보기', getHarnessExecutionBriefActionLabel\(execution\)\)/);
assert.match(appJs, /const visibleHarnessBriefActionLabel = getHarnessExecutionBriefActionLabel\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessBriefActionLabel = getHarnessExecutionBriefActionLabel\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /\$\{escapeHtml\(visibleHarnessBriefActionLabel\)\}/);
assert.match(appJs, /\$\{escapeHtml\(hiddenHarnessBriefActionLabel\)\}/);
assert.match(appJs, /const canRenderHiddenHarnessPreview = Boolean\(hiddenHarnessPreviewText\);/);
assert.match(appJs, /canRenderHiddenHarnessPreview\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-execution-preview"[\s\S]*?data-action="summarize-harness-execution-preview"/);
assert.doesNotMatch(appJs, /\$\{\s*hiddenHarnessPreviewText\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-execution-preview"[\s\S]*?data-action="summarize-harness-execution-preview"/);
assert.match(appJs, /const historyHarnessBriefActionLabel = getHarnessExecutionBriefActionLabel\(execution\);/);
assert.match(appJs, /\$\{escapeHtml\(historyHarnessBriefActionLabel\)\}/);
assert.match(appJs, /const canRenderHistoryHarnessPreview = Boolean\(historyHarnessPreviewText\);/);
assert.match(appJs, /canRenderHistoryHarnessPreview\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-execution-preview"[\s\S]*?data-action="summarize-harness-execution-preview"/);
assert.doesNotMatch(appJs, /\$\{\s*historyHarnessPreviewText\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-execution-preview"[\s\S]*?data-action="summarize-harness-execution-preview"/);
assert.match(appJs, /data-harness-output-brief="true"/);
assert.match(appJs, /data-harness-result-hidden-output-brief="true"/);
assert.match(appJs, /data-harness-history-output-brief="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionBriefActionLabel: {
        helper: 'getHarnessExecutionBriefActionLabel',
        labels: ['리포트 요약', '출력 요약'],
        namedValues: [
          'canRenderHiddenHarnessPreview',
          'canRenderHistoryHarnessPreview',
        ],
        surfaces: ['latest-result', 'hidden-result', 'recent-history', 'handoff-summary'],
      },
    },
    null,
    2,
  ),
);
