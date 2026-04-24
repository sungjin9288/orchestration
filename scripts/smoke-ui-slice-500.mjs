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
  /\.harness-execution-result-packet\s*\{[\s\S]*border:\s*1px solid rgba\(33,\s*57,\s*49,\s*0\.18\);[\s\S]*box-shadow:\s*[\s\S]*0 0 0 1px rgba\(55,\s*93,\s*120,\s*0\.03\),[\s\S]*0 20px 34px rgba\(20,\s*34,\s*42,\s*0\.09\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultPacketOuterShadow: {
        insertionPoint: 'visibleExecutionResultRegister->packetFrame->outerShadow',
        marker: 'visible result packet uses stronger outer shadow followup',
      },
    },
    null,
    2,
  ),
);
