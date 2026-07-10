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
  /\.harness-execution-history-action-shelf \[data-harness-history-reuse="true"\]\s*\{[\s\S]*border-color:\s*rgba\(121,\s*98,\s*47,\s*0\.18\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(248,\s*250,\s*252,\s*0\.96\),\s*rgba\(234,\s*239,\s*244,\s*0\.98\)\);[\s\S]*color:\s*color-mix\(in srgb,\s*var\(--text\)\s*74%,\s*var\(--deliverables\)\s*26%\);[\s\S]*box-shadow:\s*[\s\S]*0 7px 14px rgba\(121,\s*98,\s*47,\s*0\.08\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryActionShelfReuseBorderFollowup: {
        insertionPoint: 'executionHistoryItemPacket->actionShelf->reuseControlBorderBalance',
        marker: 'history action shelf reuse button uses stronger border balance',
      },
    },
    null,
    2,
  ),
);
