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

assert.match(harnessLabels, /export function getHarnessExecutionBriefCopyTitle\(execution\) \{/);
assert.match(harnessLabels, /return `하네스 \$\{getHarnessExecutionBriefCopyStatusLabel\(execution\)\}`/);
assert.match(appJs, /function formatHarnessOutputBriefForCopy\(outputBrief, execution\)/);
assert.match(appJs, /getHarnessExecutionBriefCopyTitle\(execution\)/);
assert.match(appJs, /const visibleHarnessOutputBrief = getHarnessOutputBriefResult\(/);
assert.match(
  appJs,
  /const visibleHarnessOutputBriefCopyText = visibleHarnessOutputBrief\s+\? formatHarnessOutputBriefForCopy\(visibleHarnessOutputBrief, visibleHarnessExecutionResult\)\s+: '';/,
);
assert.match(
  appJs,
  /const visibleHarnessOutputBriefCopyStatusLabel =\s+getHarnessExecutionBriefCopyStatusLabel\(visibleHarnessExecutionResult\);/,
);
assert.match(appJs, /data-output-brief-label="\$\{escapeHtml\(visibleHarnessOutputBriefCopyStatusLabel\)\}"/);
assert.match(appJs, /data-output-brief-text="\$\{escapeHtml\(visibleHarnessOutputBriefCopyText\)\}"/);
assert.doesNotMatch(
  appJs,
  /data-output-brief-text="\$\{escapeHtml\(formatHarnessOutputBriefForCopy\(getHarnessOutputBriefResult\(visibleHarnessExecutionResult\)\)\)\}"/,
);
assert.doesNotMatch(
  appJs,
  /data-output-brief-text="\$\{escapeHtml\(formatHarnessOutputBriefForCopy\(visibleHarnessOutputBrief, visibleHarnessExecutionResult\)\)\}"/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionBriefCopyPayloadTitle: {
        helper: 'getHarnessExecutionBriefCopyTitle',
        derivedFrom: 'getHarnessExecutionBriefCopyStatusLabel',
        defaultTitle: '하네스 출력 요약',
        policyReportTitle: '하네스 리포트 요약',
        surface: 'latest-result copy payload',
      },
    },
    null,
    2,
  ),
);
