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
  /\.harness-execution-result-packet \.card-title-row-tight \.token-success\s*\{[\s\S]*box-shadow:\s*[\s\S]*0 8px 16px rgba\(62,\s*104,\s*84,\s*0\.09\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultHeaderStatusShadow: {
        insertionPoint: 'visibleExecutionResultRegister->headerRowShell->successBadgeTier',
        marker: 'visible result header status token uses stronger shadow',
      },
    },
    null,
    2,
  ),
);
