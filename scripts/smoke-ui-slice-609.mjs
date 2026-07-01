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

assert.match(appJs, /from '\.\/harness-labels\.js'/);
assert.match(harnessLabels, /export function formatHarnessPolicyReportForCopy\(payload\)/);
assert.match(harnessLabels, /하네스 정책 리포트/);
assert.match(harnessLabels, /입력 확인:/);
assert.match(harnessLabels, /출력 예정:/);
assert.match(harnessLabels, /권한 정책:/);
assert.match(harnessLabels, /실행 방식:/);
assert.match(harnessLabels, /CLI 상태:/);
assert.match(appJs, /data-action="copy-harness-policy-report"/);
assert.match(appJs, /const visibleHarnessPolicyReportPayload = getHarnessPolicyReportPayload\(visibleHarnessExecutionResult\);/);
assert.match(
  appJs,
  /const visibleHarnessPolicyReportCopyText = visibleHarnessPolicyReportPayload\s+\? formatHarnessPolicyReportForCopy\(visibleHarnessPolicyReportPayload\)\s+: '';/,
);
assert.match(appJs, /data-policy-report-text="\$\{escapeHtml\(visibleHarnessPolicyReportCopyText\)\}"/);
assert.match(appJs, /data-harness-policy-report-copy="true"/);
assert.match(appJs, /function copyHarnessPolicyReport\(reportText\)/);
assert.match(appJs, /const emptyPolicyReportCopyMessage = '복사할 하네스 정책 리포트가 없습니다\.';/);
assert.match(appJs, /const copiedPolicyReportMessage = \(\) => '하네스 정책 리포트를 복사했습니다\.';/);
assert.match(appJs, /const unsupportedPolicyReportCopyMessage = \(\) =>\s+'클립보드 미지원 환경입니다\. 하네스 정책 리포트를 직접 확인하세요\.';/);
assert.match(appJs, /emptyErrorMessage: emptyPolicyReportCopyMessage/);
assert.match(appJs, /copiedMessage: copiedPolicyReportMessage/);
assert.match(appJs, /unsupportedMessage: unsupportedPolicyReportCopyMessage/);
assert.doesNotMatch(appJs, /copiedMessage: \(\) => '하네스 정책 리포트를 복사했습니다\.'/);
assert.match(appJs, /copyHarnessPolicyReport\(actionButton\.dataset\.policyReportText\)/);
assert.match(appJs, /리포트 복사/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessPolicyReportCopy: {
        action: 'copy-harness-policy-report',
        helperModule: 'ui/harness-labels.js',
        source: 'latest-result policy report summary',
      },
    },
    null,
    2,
  ),
);
