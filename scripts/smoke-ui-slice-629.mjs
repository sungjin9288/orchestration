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

assert.match(harnessLabels, /export function getHarnessExecutionBriefCopyActionLabel\(execution\) \{/);
assert.match(harnessLabels, /execution\?\.actionMode === 'policy-report' \? '리포트 요약 복사' : '요약 복사'/);
assert.match(harnessLabels, /export function getHarnessExecutionBriefCopyStatusLabel\(execution\) \{/);
assert.match(harnessLabels, /execution\?\.actionMode === 'policy-report' \? '리포트 요약' : '출력 요약'/);
assert.match(harnessLabels, /handoffs\.push\(getHarnessExecutionBriefCopyActionLabel\(execution\)\)/);
assert.match(
  appJs,
  /const visibleHarnessOutputBriefCopyStatusLabel =\s+getHarnessExecutionBriefCopyStatusLabel\(visibleHarnessExecutionResult\);/,
);
assert.match(
  appJs,
  /const visibleHarnessOutputBriefCopyActionLabel =\s+getHarnessExecutionBriefCopyActionLabel\(visibleHarnessExecutionResult\);/,
);
assert.match(appJs, /data-output-brief-label="\$\{escapeHtml\(visibleHarnessOutputBriefCopyStatusLabel\)\}"/);
assert.match(appJs, /async function copyHarnessOutputBrief\(briefText, label = '출력 요약'\)/);
assert.match(appJs, /const briefLabel = label \|\| '출력 요약'/);
assert.match(appJs, /const emptyOutputBriefCopyMessage = `복사할 하네스 \$\{briefLabel\}이 없습니다\.`;/);
assert.match(appJs, /const copiedOutputBriefMessage = \(\) => `하네스 \$\{briefLabel\}을 복사했습니다\.`;/);
assert.match(appJs, /const unsupportedOutputBriefCopyMessage = \(\) =>\s+`클립보드 미지원 환경입니다\. 하네스 \$\{briefLabel\}을 직접 확인하세요\.`;/);
assert.match(appJs, /emptyErrorMessage: emptyOutputBriefCopyMessage/);
assert.match(appJs, /copiedMessage: copiedOutputBriefMessage/);
assert.match(appJs, /unsupportedMessage: unsupportedOutputBriefCopyMessage/);
assert.doesNotMatch(appJs, /copiedMessage: \(\) => `하네스 \$\{briefLabel\}을 복사했습니다\.`/);
assert.match(appJs, /actionButton\.dataset\.outputBriefLabel/);
assert.match(appJs, /data-harness-output-brief-copy="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionBriefCopyLabel: {
        helpers: [
          'getHarnessExecutionBriefCopyActionLabel',
          'getHarnessExecutionBriefCopyStatusLabel',
        ],
        labels: ['리포트 요약 복사', '요약 복사', '리포트 요약', '출력 요약'],
        surfaces: ['latest-result', 'handoff-summary', 'clipboard-status'],
      },
    },
    null,
    2,
  ),
);
