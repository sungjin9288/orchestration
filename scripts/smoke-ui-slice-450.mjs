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
  /\.harness-execution-result-hidden-packet\s*\{[\s\S]*border:\s*1px solid rgba\(33,\s*57,\s*49,\s*0\.17\);/s,
);
assert.ok(
  stylesCss.includes('0 0 0 1px rgba(55, 93, 120, 0.02),'),
  'hidden result packet should include the frame-outline shadow token',
);
assert.ok(
  stylesCss.includes('0 18px 30px rgba(20, 34, 42, 0.07);'),
  'hidden result packet should include the stronger frame-depth shadow token',
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPacketBorderContrast: {
        insertionPoint: 'hiddenExecutionResultRegister->packetFrame->borderContrast',
        marker: 'hidden result packet uses stronger border contrast',
      },
    },
    null,
    2,
  ),
);
