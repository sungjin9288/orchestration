import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const harnessExecutionTokensPath = path.join(repoRoot, 'ui', 'harness-execution-tokens.js');
const harnessLabelsPath = path.join(repoRoot, 'ui', 'harness-labels.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessExecutionTokens = fs.readFileSync(harnessExecutionTokensPath, 'utf8');
const harnessLabels = fs.readFileSync(harnessLabelsPath, 'utf8');

assert.match(harnessLabels, /export function getHarnessExecutionRerunActionLabel\(execution\) \{/);
assert.match(harnessLabels, /execution\?\.actionMode === 'policy-report' \? '같은 경로 정책 리포트' : '같은 경로 재실행'/);
assert.match(appJs, /const visibleHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /\$\{escapeHtml\(visibleHarnessRerunActionLabel\)\}/);
assert.match(appJs, /\$\{escapeHtml\(hiddenHarnessRerunActionLabel\)\}/);
assert.match(appJs, /const historyHarnessRerunActionLabel = getHarnessExecutionRerunActionLabel\(execution\);/);
assert.match(appJs, /\$\{escapeHtml\(historyHarnessRerunActionLabel\)\}/);
assert.match(appJs, /function getHarnessPolicyReportDataValue\(isPolicyReport\) \{/);
assert.match(appJs, /return isPolicyReport \? 'true' : 'false';/);
assert.match(harnessExecutionTokens, /export function isHarnessPolicyReportExecution\(execution\) \{/);
assert.match(harnessExecutionTokens, /return execution\?\.actionMode === 'policy-report';/);
assert.match(appJs, /const visibleHarnessIsPolicyReport =\s+isHarnessPolicyReportExecution\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessIsPolicyReport =\s+isHarnessPolicyReportExecution\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const visibleHarnessPolicyReportDataValue =\s+getHarnessPolicyReportDataValue\(visibleHarnessIsPolicyReport\);/);
assert.match(appJs, /const hiddenHarnessPolicyReportDataValue =\s+getHarnessPolicyReportDataValue\(hiddenHarnessIsPolicyReport\);/);
assert.match(appJs, /const historyHarnessIsPolicyReport =\s+isHarnessPolicyReportExecution\(execution\);/);
assert.match(appJs, /const historyHarnessPolicyReportDataValue =\s+getHarnessPolicyReportDataValue\(historyHarnessIsPolicyReport\);/);
assert.match(appJs, /data-policy-report="\$\{visibleHarnessPolicyReportDataValue\}"/);
assert.match(appJs, /data-policy-report="\$\{hiddenHarnessPolicyReportDataValue\}"/);
assert.match(appJs, /data-policy-report="\$\{historyHarnessPolicyReportDataValue\}"/);
assert.match(appJs, /const policyReport = actionButton\?\.dataset\.policyReport === 'true'/);
assert.match(appJs, /const rerunHarnessSubjectCopy = statusCard\?\.primaryHarnessId/);
assert.match(appJs, /const rerunHarnessModeCopy = policyReport \? '정책 리포트로 다시 확인' : '다시 실행';/);
assert.match(appJs, /const rerunHarnessPendingMessage =\s+`\$\{rerunHarnessSubjectCopy\}의 최근 실행 경로를 \$\{rerunHarnessModeCopy\}하는 중…`;/);
assert.match(appJs, /pendingMessage: rerunHarnessPendingMessage,/);
assert.match(appJs, /policyReport,/);
assert.doesNotMatch(appJs, /const visibleHarnessPolicyReportFlag =/);
assert.doesNotMatch(appJs, /const hiddenHarnessPolicyReportFlag =/);
assert.doesNotMatch(appJs, /const historyHarnessPolicyReportFlag =/);
assert.doesNotMatch(appJs, /const visibleHarnessIsPolicyReport =\s+visibleHarnessExecutionResult\?\.actionMode === 'policy-report';/);
assert.doesNotMatch(appJs, /const hiddenHarnessIsPolicyReport =\s+hiddenHarnessExecutionResult\?\.actionMode === 'policy-report';/);
assert.doesNotMatch(appJs, /const historyHarnessIsPolicyReport =\s+execution\.actionMode === 'policy-report';/);
assert.doesNotMatch(appJs, /pendingMessage: `\$\{rerunHarnessSubjectCopy\}의 최근 실행 경로를 \$\{rerunHarnessModeCopy\}하는 중…`/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionPolicyReportRerun: {
        helper: 'getHarnessExecutionRerunActionLabel',
        preservesPolicyReport: true,
        policyReportDataValues: [
          'isHarnessPolicyReportExecution',
          'visibleHarnessPolicyReportDataValue',
          'hiddenHarnessPolicyReportDataValue',
          'historyHarnessPolicyReportDataValue',
        ],
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
