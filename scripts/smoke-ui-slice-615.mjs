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

assert.match(appJs, /function formatHarnessExecutionPacketForCopy\(execution\)/);
assert.match(appJs, /function getHarnessExecutionPacketContext\(execution\) \{/);
assert.match(appJs, /hasOutputBrief: Boolean\(getHarnessOutputBriefResult\(execution, state\.lastHarnessOutputBriefResult\)\)/);
assert.match(appJs, /hasPolicyReport: Boolean\(getHarnessPolicyReportPayload\(execution\)\)/);
assert.match(
  harnessLabels,
  /`\$\{getHarnessExecutionBriefCopyStatusLabel\(execution\)\}: \$\{context\.hasOutputBrief \? '있음' : '없음'\}`/,
);
assert.match(harnessLabels, /정책 리포트: \$\{context\.hasPolicyReport \? '있음' : '없음'\}/);
assert.match(appJs, /data-action="copy-harness-execution-packet"/);
assert.match(
  appJs,
  /const visibleHarnessExecutionPacketText = visibleHarnessExecutionResult\s+\? formatHarnessExecutionPacketForCopy\(visibleHarnessExecutionResult\)\s+: '';/,
);
assert.match(
  appJs,
  /const hiddenHarnessExecutionPacketText = hiddenHarnessExecutionResult\s+\? formatHarnessExecutionPacketForCopy\(hiddenHarnessExecutionResult\)\s+: '';/,
);
assert.match(
  appJs,
  /const historyHarnessExecutionPacketText =\s+formatHarnessExecutionPacketForCopy\(execution\);/,
);
assert.match(appJs, /data-execution-packet-text="\$\{escapeHtml\(visibleHarnessExecutionPacketText\)\}"/);
assert.match(appJs, /data-execution-packet-text="\$\{escapeHtml\(hiddenHarnessExecutionPacketText\)\}"/);
assert.match(appJs, /data-execution-packet-text="\$\{escapeHtml\(historyHarnessExecutionPacketText\)\}"/);
assert.match(appJs, /data-harness-execution-packet-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-packet-copy="true"/);
assert.match(appJs, /data-harness-history-packet-copy="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionPacketBriefPresence: {
        formatter: 'formatHarnessExecutionPacketForCopy',
        labelSource: 'getHarnessExecutionBriefCopyStatusLabel',
        includes: ['output-brief presence', 'policy-report presence'],
      },
    },
    null,
    2,
  ),
);
