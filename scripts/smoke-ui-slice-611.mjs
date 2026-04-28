import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const hiddenExecutionKey = String\(actionButton\?\.dataset\.hiddenExecutionKey \|\| ''\)\.trim\(\);/);
assert.match(appJs, /const hiddenExecution =\s+hiddenExecutionKey && currentExecutionKey === hiddenExecutionKey \? currentExecution : null;/);
assert.match(appJs, /getHarnessExecutionResultKey\(hiddenExecution\)/);
assert.match(appJs, /if \(hiddenExecution\) \{/);
assert.match(appJs, /state\.lastHarnessExecutionResult = hiddenExecution;/);
assert.match(appJs, /data-hidden-execution-key="\$\{escapeHtml\(getHarnessExecutionResultKey\(hiddenHarnessExecutionResult\) \|\| ''\)\}"/);
assert.match(appJs, /data-harness-result-hidden-output-brief="true"/);
assert.match(appJs, /data-action="summarize-harness-execution-preview"/);
assert.match(appJs, /getHarnessExecutionBriefActionLabel\(hiddenHarnessExecutionResult\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      hiddenHarnessOutputBrief: {
        action: 'summarize-harness-execution-preview',
        labelSource: 'getHarnessExecutionBriefActionLabel',
        restoreTarget: 'latest-result packet',
      },
    },
    null,
    2,
  ),
);
