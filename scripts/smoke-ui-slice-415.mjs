import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const appJs = fs.readFileSync(appPath, 'utf8');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /data-harness-execution-history-summary-rack="true"/);
assert.match(
  appJs,
  /data-harness-execution-history-item="true"[\s\S]*?data-harness-execution-history-summary-rack="true"[\s\S]*?실행[\s\S]*?입력[\s\S]*?출력[\s\S]*?data-harness-execution-history-action-shelf="true"/,
);

assert.match(stylesCss, /\.harness-execution-history-summary-rack\s*\{/);
assert.match(stylesCss, /\.harness-execution-history-summary-rack::before\s*\{/);
assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack \.control-overview-register-row\s*\{[\s\S]*padding:\s*2px 0;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistorySummaryRackDesign: {
        insertionPoint: 'harnessRunDesk->historySummaryRackDesign->historyRowSummary',
        marker: 'data-harness-execution-history-summary-rack',
      },
    },
    null,
    2,
  ),
);
