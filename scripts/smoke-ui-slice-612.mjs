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

assert.match(appJs, /data-harness-policy-report-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-policy-report-copy="true"/);
assert.match(appJs, /data-harness-history-policy-report-copy="true"/);
assert.match(appJs, /const hiddenHarnessPolicyReportPayload = getHarnessPolicyReportPayload\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const canRenderHiddenHarnessPolicyReportCopy = Boolean\(hiddenHarnessPolicyReportPayload\);/);
assert.match(appJs, /canRenderHiddenHarnessPolicyReportCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-policy-report"/);
assert.doesNotMatch(appJs, /\$\{\s*hiddenHarnessPolicyReportPayload\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-policy-report"/);
assert.match(appJs, /const historyHarnessPolicyReportPayload = getHarnessPolicyReportPayload\(execution\);/);
assert.match(appJs, /const canRenderHistoryHarnessPolicyReportCopy =\s+Boolean\(historyHarnessPolicyReportPayload\);/);
assert.match(appJs, /const historyHarnessPolicyReportCopyMarkup =\s+canRenderHistoryHarnessPolicyReportCopy/);
assert.match(appJs, /canRenderHistoryHarnessPolicyReportCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-policy-report"/);
assert.match(appJs, /\$\{historyHarnessPolicyReportCopyMarkup\}/);
assert.doesNotMatch(appJs, /\$\{\s*canRenderHistoryHarnessPolicyReportCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-policy-report"/);
assert.doesNotMatch(appJs, /\$\{\s*historyHarnessPolicyReportPayload\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-policy-report"/);
assert.match(harnessLabels, /export function formatHarnessPolicyReportForCopy\(payload\) \{/);
assert.match(harnessLabels, /if \(!payload\) \{\s+return '';\s+\}/);
assert.match(appJs, /const hiddenHarnessPolicyReportCopyText =\s+formatHarnessPolicyReportForCopy\(hiddenHarnessPolicyReportPayload\);/);
assert.match(appJs, /const visibleHarnessPolicyReportCopyText =\s+formatHarnessPolicyReportForCopy\(visibleHarnessPolicyReportPayload\);/);
assert.match(appJs, /const historyHarnessPolicyReportCopyText =\s+formatHarnessPolicyReportForCopy\(historyHarnessPolicyReportPayload\);/);
assert.doesNotMatch(appJs, /const hiddenHarnessPolicyReportCopyText = canRenderHiddenHarnessPolicyReportCopy/);
assert.doesNotMatch(appJs, /const visibleHarnessPolicyReportCopyText = canRenderVisibleHarnessPolicyReportCopy/);
assert.doesNotMatch(appJs, /const historyHarnessPolicyReportCopyText = canRenderHistoryHarnessPolicyReportCopy/);
assert.doesNotMatch(appJs, /const hiddenHarnessPolicyReportCopyText = hiddenHarnessPolicyReportPayload/);
assert.doesNotMatch(appJs, /const historyHarnessPolicyReportCopyText = historyHarnessPolicyReportPayload/);
assert.match(appJs, /const visibleHarnessPolicyReportCopyMarkup = canRenderVisibleHarnessPolicyReportCopy/);
assert.match(appJs, /\$\{visibleHarnessPolicyReportCopyMarkup\}/);
assert.doesNotMatch(appJs, /\$\{\s*canRenderVisibleHarnessPolicyReportCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-policy-report"/);
assert.match(appJs, /data-policy-report-text="\$\{escapeHtml\(visibleHarnessPolicyReportCopyText\)\}"/);
assert.match(appJs, /data-policy-report-text="\$\{escapeHtml\(hiddenHarnessPolicyReportCopyText\)\}"/);
assert.match(appJs, /data-policy-report-text="\$\{escapeHtml\(historyHarnessPolicyReportCopyText\)\}"/);
assert.match(appJs, /copyHarnessPolicyReport\(actionButton\.dataset\.policyReportText\)/);
assert.match(appJs, /data-action="copy-harness-policy-report"/);
assert.match(appJs, />\s*리포트 복사\s*</);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessPolicyReportCopyCoverage: {
        action: 'copy-harness-policy-report',
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
        namedValues: [
          'canRenderHiddenHarnessPolicyReportCopy',
          'canRenderHistoryHarnessPolicyReportCopy',
          'visibleHarnessPolicyReportCopyText',
          'visibleHarnessPolicyReportCopyMarkup',
          'hiddenHarnessPolicyReportCopyText',
          'historyHarnessPolicyReportCopyText',
          'historyHarnessPolicyReportCopyMarkup',
        ],
      },
    },
    null,
    2,
  ),
);
