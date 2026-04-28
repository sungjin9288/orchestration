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
assert.match(
  appJs,
  /`\$\{getHarnessExecutionBriefCopyStatusLabel\(execution\)\}: \$\{getHarnessOutputBriefResult\(execution\) \? '있음' : '없음'\}`/,
);
assert.match(appJs, /정책 리포트: \$\{getHarnessPolicyReportPayload\(execution\) \? '있음' : '없음'\}/);
assert.match(appJs, /data-action="copy-harness-execution-packet"/);
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
