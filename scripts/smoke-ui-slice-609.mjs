import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function formatHarnessPolicyReportForCopy\(payload\)/);
assert.match(appJs, /하네스 정책 리포트/);
assert.match(appJs, /입력 확인:/);
assert.match(appJs, /출력 예정:/);
assert.match(appJs, /권한 정책:/);
assert.match(appJs, /실행 방식:/);
assert.match(appJs, /CLI 상태:/);
assert.match(appJs, /data-action="copy-harness-policy-report"/);
assert.match(appJs, /data-policy-report-text="\$\{escapeHtml\(formatHarnessPolicyReportForCopy\(getHarnessPolicyReportPayload\(visibleHarnessExecutionResult\)\)\)\}"/);
assert.match(appJs, /data-harness-policy-report-copy="true"/);
assert.match(appJs, /function copyHarnessPolicyReport\(reportText\)/);
assert.match(appJs, /copyHarnessPolicyReport\(actionButton\.dataset\.policyReportText\)/);
assert.match(appJs, /리포트 복사/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessPolicyReportCopy: {
        action: 'copy-harness-policy-report',
        source: 'latest-result policy report summary',
      },
    },
    null,
    2,
  ),
);
