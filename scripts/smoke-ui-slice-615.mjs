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
assert.match(appJs, /const canCopyVisibleHarnessExecutionPacket = Boolean\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const canCopyHiddenHarnessExecutionPacket = Boolean\(hiddenHarnessExecutionResult\);/);
assert.match(harnessLabels, /if \(!execution\?\.harnessId\) \{\s+return '';\s+\}/);
assert.match(
  appJs,
  /const visibleHarnessExecutionPacketText =\s+formatHarnessExecutionPacketForCopy\(visibleHarnessExecutionResult\);/,
);
assert.match(
  appJs,
  /const hiddenHarnessExecutionPacketText =\s+formatHarnessExecutionPacketForCopy\(hiddenHarnessExecutionResult\);/,
);
assert.match(
  appJs,
  /const historyHarnessExecutionPacketText =\s+formatHarnessExecutionPacketForCopy\(execution\);/,
);
assert.match(appJs, /const visibleHarnessExecutionPacketCopyMarkup = canCopyVisibleHarnessExecutionPacket/);
assert.match(appJs, /const hiddenHarnessExecutionPacketCopyMarkup = canCopyHiddenHarnessExecutionPacket/);
assert.match(appJs, /\$\{visibleHarnessExecutionPacketCopyMarkup\}/);
assert.match(appJs, /\$\{hiddenHarnessExecutionPacketCopyMarkup\}/);
assert.match(appJs, /const historyHarnessExecutionPacketCopyMarkup = `\s+<button[\s\S]*?data-action="copy-harness-execution-packet"/);
assert.match(appJs, /\$\{historyHarnessExecutionPacketCopyMarkup\}/);
assert.match(appJs, /data-execution-packet-text="\$\{escapeHtml\(visibleHarnessExecutionPacketText\)\}"/);
assert.match(appJs, /data-execution-packet-text="\$\{escapeHtml\(hiddenHarnessExecutionPacketText\)\}"/);
assert.match(appJs, /data-execution-packet-text="\$\{escapeHtml\(historyHarnessExecutionPacketText\)\}"/);
assert.match(appJs, /data-harness-execution-packet-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-packet-copy="true"/);
assert.match(appJs, /data-harness-history-packet-copy="true"/);
assert.doesNotMatch(
  appJs,
  /\$\{historyHarnessRequestIdCopyMarkup\}\s+<button[\s\S]*?data-action="copy-harness-execution-packet"/,
);
assert.doesNotMatch(
  appJs,
  /\$\{visibleHarnessRequestIdCopyMarkup\}\s+<button[\s\S]*?data-action="copy-harness-execution-packet"/,
);
assert.doesNotMatch(
  appJs,
  /\$\{canRenderHiddenHarnessRequestIdCopy[\s\S]*?\}\s+<button[\s\S]*?data-action="copy-harness-execution-packet"/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionPacketBriefPresence: {
        formatter: 'formatHarnessExecutionPacketForCopy',
        formatterFallback: 'formatHarnessExecutionPacketForCopy',
        labelSource: 'getHarnessExecutionBriefCopyStatusLabel',
        namedPredicates: [
          'canCopyVisibleHarnessExecutionPacket',
          'canCopyHiddenHarnessExecutionPacket',
          'visibleHarnessExecutionPacketCopyMarkup',
          'hiddenHarnessExecutionPacketCopyMarkup',
          'historyHarnessExecutionPacketCopyMarkup',
        ],
        includes: ['output-brief presence', 'policy-report presence'],
      },
    },
    null,
    2,
  ),
);
