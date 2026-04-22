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
  /\.harness-execution-history-packet \.card-title-row-tight strong\s*\{[\s\S]*color:\s*rgba\(22,\s*36,\s*48,\s*0\.97\);[\s\S]*letter-spacing:\s*0\.01em;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryHeaderTitleInkFollowup: {
        insertionPoint: 'executionHistoryPacket->headerRowShell->titleInkEmphasis',
        marker: 'history header title uses stronger ink followup',
      },
    },
    null,
    2,
  ),
);
