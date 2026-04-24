import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack \.control-overview-register-row:not\(:first-child\) \.control-overview-register-value\s*\{[\s\S]*font-family:\s*"IBM Plex Mono", "SFMono-Regular", Consolas, monospace;[\s\S]*font-size:\s*0\.76rem;[\s\S]*letter-spacing:\s*-0\.01em;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryPathValueMonoDesign: {
        insertionPoint: 'harnessRunDesk->historyPathValueMonoDesign->historyRowPathValues',
        marker: 'history summary rack path values use mono emphasis',
      },
    },
    null,
    2,
  ),
);
