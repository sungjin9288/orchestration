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
  /\.harness-execution-history-summary-rack \.control-overview-register-label\s*\{[\s\S]*letter-spacing:\s*0\.08em;[\s\S]*color:\s*rgba\(43,\s*58,\s*69,\s*0\.68\);/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack \.control-overview-register-value\s*\{[\s\S]*font-size:\s*0\.8rem;[\s\S]*font-weight:\s*600;/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-history-summary-rack \.control-overview-register-row:first-child \.control-overview-register-value\s*\{[\s\S]*font-size:\s*0\.84rem;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistorySummaryEmphasisDesign: {
        insertionPoint: 'harnessRunDesk->historySummaryEmphasisDesign->historyRowLabelValueHierarchy',
        marker: 'harness-execution-history-summary-rack label/value emphasis',
      },
    },
    null,
    2,
  ),
);
