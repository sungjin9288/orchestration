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
  /\.harness-execution-history-item-packet\s*\{[\s\S]*box-shadow:\s*[\s\S]*0 12px 22px rgba\(20,\s*34,\s*42,\s*0\.06\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryItemPacketOuterShadow: {
        insertionPoint: 'harnessRunDesk->historyRowPacket->outerShadow',
        marker: 'history item packet uses stronger outer shadow followup',
      },
    },
    null,
    2,
  ),
);
