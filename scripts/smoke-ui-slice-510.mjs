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
  /\.harness-execution-history-packet \.card-title-row-tight\s*\{[\s\S]*padding:\s*5px 7px;[\s\S]*border-radius:\s*10px;[\s\S]*box-shadow:\s*[\s\S]*0 4px 10px rgba\(20,\s*34,\s*42,\s*0\.03\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryHeaderOuterShadow: {
        insertionPoint: 'executionHistoryPacket->headerRowShell->outerShadow',
        marker: 'history header row uses stronger outer shadow',
      },
    },
    null,
    2,
  ),
);
