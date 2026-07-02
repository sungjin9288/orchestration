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
  /renderHarnessHistorySummaryRow\('실행'[\s\S]*?renderHarnessHistorySummaryRow\('입력'[\s\S]*?historyHarnessOutputLabel[\s\S]*?data-harness-execution-history-item="true"[\s\S]*?data-harness-execution-history-summary-rack="true"[\s\S]*?data-harness-execution-history-action-shelf="true"/,
);

assert.match(stylesCss, /\.harness-execution-history-summary-rack\s*\{/);
assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack\s*\{[\s\S]*box-shadow:\s*[\s\S]*0 8px 16px rgba\(20,\s*34,\s*42,\s*0\.045\);/s,
);
assert.match(stylesCss, /\.harness-execution-history-summary-rack::before\s*\{/);
assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack \.control-overview-register-row\s*\{[\s\S]*padding:\s*2px 0;/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack \.control-overview-register-label\s*\{[\s\S]*letter-spacing:\s*0\.08em;[\s\S]*color:\s*rgba\(43,\s*58,\s*69,\s*0\.7\);/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack \.control-overview-register-row:first-child \.control-overview-register-value\s*\{[\s\S]*font-size:\s*0\.84rem;[\s\S]*color:\s*color-mix\(in srgb,\s*var\(--execution\)\s*76%,\s*#1f2732\s*24%\);/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack \.control-overview-register-row:not\(:first-child\) \.control-overview-register-value\s*\{[\s\S]*font-family:\s*"IBM Plex Mono",\s*"SFMono-Regular",\s*Consolas,\s*monospace;[\s\S]*font-size:\s*0\.76rem;[\s\S]*letter-spacing:\s*-0\.01em;[\s\S]*color:\s*color-mix\(in srgb,\s*var\(--text\)\s*84%,\s*var\(--execution\)\s*16%\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistorySummaryRackDesign: {
        insertionPoint: 'harnessRunDesk->historySummaryRackDesign->historyRowSummary',
        marker: 'history summary rack uses balanced label tone',
      },
    },
    null,
    2,
  ),
);
