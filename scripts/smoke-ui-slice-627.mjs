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

assert.match(harnessLabels, /export function getHarnessExecutionHideActionLabel\(execution\) \{/);
assert.match(harnessLabels, /hideAction:\s*\{\s*policyReport: '리포트 숨기기',\s*execution: '결과 숨기기',\s*\}/);
assert.match(harnessLabels, /return getHarnessExecutionLabel\(execution, 'hideAction'\);/);
assert.match(harnessLabels, /export function getHarnessExecutionShowActionLabel\(execution\) \{/);
assert.match(harnessLabels, /showAction:\s*\{\s*policyReport: '리포트 다시 보기',\s*execution: '결과 다시 보기',\s*\}/);
assert.match(harnessLabels, /return getHarnessExecutionLabel\(execution, 'showAction'\);/);
assert.match(appJs, /const visibleHarnessHideActionLabel = getHarnessExecutionHideActionLabel\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessShowActionLabel = getHarnessExecutionShowActionLabel\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const visibleHarnessHideActionMarkup = `/);
assert.match(appJs, /const visibleHarnessActionShelfMarkup = `\s+\$\{visibleHarnessInputPathActionsMarkup\}/);
assert.match(appJs, /\$\{visibleHarnessHideActionMarkup\}/);
assert.match(appJs, /\$\{visibleHarnessActionShelfMarkup\}/);
assert.doesNotMatch(
  appJs,
  /\$\{visibleHarnessPolicyReportCopyMarkup\}\s+<button[\s\S]*?data-action="hide-harness-execution-result"/,
);
assert.doesNotMatch(
  appJs,
  /form-actions-compact">\s+\$\{visibleHarnessInputPathActionsMarkup\}\s+\$\{visibleHarnessOutputPathCopyMarkup\}/,
);
assert.match(appJs, /\$\{escapeHtml\(visibleHarnessHideActionLabel\)\}/);
assert.match(appJs, /\$\{escapeHtml\(hiddenHarnessShowActionLabel\)\}/);
assert.match(appJs, /const historyHarnessShowActionLabel = getHarnessExecutionShowActionLabel\(execution\);/);
assert.match(appJs, /\$\{escapeHtml\(historyHarnessShowActionLabel\)\}/);
assert.match(appJs, /const historyHarnessRestorePreviewMarkup = `\s+<button[\s\S]*?data-action="restore-harness-execution-preview"/);
assert.match(appJs, /\$\{historyHarnessRestorePreviewMarkup\}/);
assert.match(
  appJs,
  /const historyHarnessActionShelfMarkup = `\s+\$\{historyHarnessInputPathCopyMarkup\}\s+\$\{historyHarnessRestorePreviewMarkup\}\s+\$\{historyHarnessOutputPathCopyMarkup\}\s+\$\{historyHarnessRequestIdCopyMarkup\}\s+\$\{historyHarnessExecutionPacketCopyMarkup\}\s+\$\{historyHarnessPolicyReportCopyMarkup\}\s+\$\{historyHarnessPathActionsMarkup\}\s+\$\{historyHarnessPreviewActionsMarkup\}/,
);
assert.match(appJs, /\$\{historyHarnessActionShelfMarkup\}/);
assert.doesNotMatch(
  appJs,
  /\$\{historyHarnessInputPathCopyMarkup\}\s+<button[\s\S]*?data-action="restore-harness-execution-preview"/,
);
assert.doesNotMatch(
  appJs,
  /form-actions-compact">\s+\$\{historyHarnessInputPathCopyMarkup\}\s+\$\{historyHarnessRestorePreviewMarkup\}\s+\$\{historyHarnessOutputPathCopyMarkup\}/,
);
assert.match(appJs, /data-harness-result-hide="true"/);
assert.match(appJs, /data-harness-result-show="true"/);
assert.match(appJs, /data-harness-history-preview="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibilityActionLabels: {
        hide: ['리포트 숨기기', '결과 숨기기'],
        show: ['리포트 다시 보기', '결과 다시 보기'],
        namedValues: [
          'visibleHarnessHideActionMarkup',
          'visibleHarnessActionShelfMarkup',
          'historyHarnessShowActionLabel',
          'historyHarnessRestorePreviewMarkup',
          'historyHarnessActionShelfMarkup',
        ],
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
