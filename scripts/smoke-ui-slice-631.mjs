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
assert.match(harnessLabels, /export function formatHarnessExecutionPacketForCopy\(execution, context = \{\}\) \{/);
assert.match(harnessLabels, /`모드: \$\{getHarnessExecutionModeLabel\(execution\)\}`/);
assert.match(harnessLabels, /`\$\{getHarnessExecutionOutputLabel\(execution\)\}: \$\{outputPath\}`/);
assert.match(harnessLabels, /`핸드오프: \$\{handoffLabel\}`/);
assert.match(
  harnessLabels,
  /`\$\{getHarnessExecutionBriefCopyStatusLabel\(execution\)\}: \$\{context\.hasOutputBrief \? '있음' : '없음'\}`/,
);
assert.doesNotMatch(
  harnessLabels,
  /`출력 요약: \$\{getHarnessOutputBriefResult\(execution\) \? '있음' : '없음'\}`/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionPacketBriefPresenceLabel: {
        formatter: 'formatHarnessExecutionPacketForCopy',
        derivedFrom: 'getHarnessExecutionBriefCopyStatusLabel',
        labels: ['리포트 요약', '출력 요약'],
        surface: 'packet-copy payload',
      },
    },
    null,
    2,
  ),
);
