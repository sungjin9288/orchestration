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
  /\.harness-execution-history-packet \.card-title-row-tight \.token-neutral\s*\{[\s\S]*box-shadow:\s*[\s\S]*0 7px 14px rgba\(20,\s*34,\s*42,\s*0\.055\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryHeaderTokenShadowFollowup: {
        insertionPoint: 'executionHistoryPacket->headerRowShell->countTokenShadow',
        marker: 'history header token uses stronger shadow followup',
      },
    },
    null,
    2,
  ),
);
