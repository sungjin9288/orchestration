import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function copyHarnessExecutionRequestId\(requestId\)/);
assert.match(appJs, /data-action="copy-harness-request-id"/);
assert.match(appJs, /const visibleHarnessRequestId =\s+visibleHarnessExecutionResult\?\.requestId \|\| visibleHarnessExecutionResult\?\.executionId \|\| '';/);
assert.match(appJs, /data-request-id="\$\{escapeHtml\(visibleHarnessRequestId\)\}"/);
assert.match(appJs, /data-harness-request-id-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-request-id-copy="true"/);
assert.match(appJs, /data-harness-history-request-id-copy="true"/);
assert.match(appJs, /copyHarnessExecutionRequestId\(actionButton\.dataset\.requestId\)/);
assert.match(appJs, /const emptyRequestIdCopyMessage = '복사할 하네스 요청 ID가 없습니다\.';/);
assert.match(appJs, /const copiedRequestIdMessage = \(value\) => `하네스 요청 ID를 복사했습니다: \$\{value\}`;/);
assert.match(appJs, /const unsupportedRequestIdCopyMessage = \(value\) =>\s+`클립보드 미지원 환경입니다\. 요청 ID를 직접 확인하세요: \$\{value\}`;/);
assert.match(appJs, /emptyErrorMessage: emptyRequestIdCopyMessage/);
assert.match(appJs, /copiedMessage: copiedRequestIdMessage/);
assert.match(appJs, /unsupportedMessage: unsupportedRequestIdCopyMessage/);
assert.doesNotMatch(appJs, /copiedMessage: \(value\) => `하네스 요청 ID를 복사했습니다: \$\{value\}`/);
assert.match(appJs, />\s*요청 ID\s*</);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRequestIdCopy: {
        action: 'copy-harness-request-id',
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
