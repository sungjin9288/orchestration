import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-harness-policy-report-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-policy-report-copy="true"/);
assert.match(appJs, /data-harness-history-policy-report-copy="true"/);
assert.match(appJs, /const hiddenHarnessPolicyReportPayload = getHarnessPolicyReportPayload\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const historyHarnessPolicyReportPayload = getHarnessPolicyReportPayload\(execution\);/);
assert.match(
  appJs,
  /const hiddenHarnessPolicyReportCopyText = hiddenHarnessPolicyReportPayload\s+\? formatHarnessPolicyReportForCopy\(hiddenHarnessPolicyReportPayload\)\s+: '';/,
);
assert.match(
  appJs,
  /const historyHarnessPolicyReportCopyText = historyHarnessPolicyReportPayload\s+\? formatHarnessPolicyReportForCopy\(historyHarnessPolicyReportPayload\)\s+: '';/,
);
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
      },
    },
    null,
    2,
  ),
);
