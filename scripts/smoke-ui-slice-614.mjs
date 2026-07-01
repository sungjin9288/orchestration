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
assert.match(appJs, /formatHarnessExecutionPacketForCopyBase\(\s*execution,\s*getHarnessExecutionPacketContext\(execution\),\s*\)/);
assert.match(harnessLabels, /export function formatHarnessExecutionPacketForCopy\(execution, context = \{\}\) \{/);
assert.match(harnessLabels, /하네스 실행 패킷/);
assert.match(harnessLabels, /대표 하네스:/);
assert.match(harnessLabels, /요청 ID:/);
assert.match(harnessLabels, /정책 리포트:/);
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
assert.match(appJs, /function copyHarnessExecutionPacket\(packetText\)/);
assert.match(appJs, /copyHarnessExecutionPacket\(actionButton\.dataset\.executionPacketText\)/);
assert.match(appJs, />\s*패킷 복사\s*</);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionPacketCopy: {
        action: 'copy-harness-execution-packet',
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
