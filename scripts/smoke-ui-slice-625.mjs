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

assert.match(harnessLabels, /export function getHarnessExecutionRerunActionLabel\(execution\) \{/);
assert.match(harnessLabels, /execution\?\.actionMode === 'policy-report' \? '같은 경로 정책 리포트' : '같은 경로 재실행'/);
assert.match(appJs, /const visibleHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /\$\{escapeHtml\(visibleHarnessRerunActionLabel\)\}/);
assert.match(appJs, /\$\{escapeHtml\(hiddenHarnessRerunActionLabel\)\}/);
assert.match(appJs, /const historyHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel\(execution\);/);
assert.match(appJs, /\$\{escapeHtml\(historyHarnessRerunActionLabel\)\}/);
assert.match(appJs, /const visibleHarnessPolicyReportFlag =\s+visibleHarnessExecutionResult\?\.actionMode === 'policy-report' \? 'true' : 'false';/);
assert.match(appJs, /const hiddenHarnessPolicyReportFlag =\s+hiddenHarnessExecutionResult\?\.actionMode === 'policy-report' \? 'true' : 'false';/);
assert.match(appJs, /const historyHarnessPolicyReportFlag =\s+execution\.actionMode === 'policy-report' \? 'true' : 'false';/);
assert.match(appJs, /data-policy-report="\$\{visibleHarnessPolicyReportFlag\}"/);
assert.match(appJs, /data-policy-report="\$\{hiddenHarnessPolicyReportFlag\}"/);
assert.match(appJs, /data-policy-report="\$\{historyHarnessPolicyReportFlag\}"/);
assert.match(appJs, /const policyReport = actionButton\?\.dataset\.policyReport === 'true'/);
assert.match(appJs, /policyReport,/);
assert.match(appJs, /정책 리포트로 다시 확인/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionPolicyReportRerun: {
        helper: 'getHarnessExecutionRerunActionLabel',
        preservesPolicyReport: true,
        policyReportFlagValues: [
          'visibleHarnessPolicyReportFlag',
          'hiddenHarnessPolicyReportFlag',
          'historyHarnessPolicyReportFlag',
        ],
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
