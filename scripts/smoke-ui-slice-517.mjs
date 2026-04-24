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
  /\.harness-execution-history-summary-rack \.control-overview-register-row:not\(:first-child\) \.control-overview-register-value\s*\{[\s\S]*font-family:\s*"IBM Plex Mono",\s*"SFMono-Regular",\s*Consolas,\s*monospace;[\s\S]*font-size:\s*0\.76rem;[\s\S]*letter-spacing:\s*-0\.01em;[\s\S]*color:\s*color-mix\(in srgb,\s*var\(--text\)\s*84%,\s*var\(--execution\)\s*16%\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistorySummaryRackSupportingRowInkFollowup: {
        insertionPoint: 'executionHistoryItemPacket->summaryRack->supportingPathValues',
        marker: 'history summary rack supporting rows use balanced ink followup',
      },
    },
    null,
    2,
  ),
);
