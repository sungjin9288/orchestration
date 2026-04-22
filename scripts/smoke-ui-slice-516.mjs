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
  /\.harness-execution-history-summary-rack \.control-overview-register-row:first-child \.control-overview-register-value\s*\{[\s\S]*font-size:\s*0\.84rem;[\s\S]*color:\s*color-mix\(in srgb,\s*var\(--execution\)\s*76%,\s*#1f2732\s*24%\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistorySummaryRackFirstRowInkFollowup: {
        insertionPoint: 'executionHistoryItemPacket->summaryRack->executedAtLeadValue',
        marker: 'history summary rack first row uses stronger ink followup',
      },
    },
    null,
    2,
  ),
);
