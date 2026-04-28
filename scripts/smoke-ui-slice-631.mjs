import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function formatHarnessExecutionPacketForCopy\(execution\)/);
assert.match(appJs, /`모드: \$\{getHarnessExecutionModeLabel\(execution\)\}`/);
assert.match(appJs, /`\$\{getHarnessExecutionOutputLabel\(execution\)\}: \$\{outputPath\}`/);
assert.match(appJs, /`핸드오프: \$\{getHarnessExecutionHandoffLabel\(execution\)\}`/);
assert.match(
  appJs,
  /`\$\{getHarnessExecutionBriefCopyStatusLabel\(execution\)\}: \$\{getHarnessOutputBriefResult\(execution\) \? '있음' : '없음'\}`/,
);
assert.doesNotMatch(
  appJs,
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
