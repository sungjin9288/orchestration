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
  /\.harness-execution-history-summary-rack \.control-overview-register-label\s*\{[\s\S]*letter-spacing:\s*0\.08em;[\s\S]*color:\s*rgba\(43,\s*58,\s*69,\s*0\.7\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistorySummaryRackLabelToneFollowup: {
        insertionPoint: 'executionHistoryItemPacket->summaryRack->supportingLabels',
        marker: 'history summary rack labels use balanced tone followup',
      },
    },
    null,
    2,
  ),
);
