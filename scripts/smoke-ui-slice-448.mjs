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
  /\.harness-execution-result-packet::before\s*\{[\s\S]*width:\s*clamp\(104px,\s*32%,\s*152px\);[\s\S]*height:\s*3px;[\s\S]*border-radius:\s*999px;[\s\S]*background:\s*linear-gradient\(90deg,\s*color-mix\(in srgb,\s*var\(--execution\)\s*82%,\s*#ffffff\s*18%\),\s*transparent\);/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-result-packet::before\s*\{[\s\S]*box-shadow:\s*0 5px 12px rgba\(55,\s*93,\s*120,\s*0\.08\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultPacketTopRailEmphasis: {
        insertionPoint: 'visibleExecutionResultRegister->packetFrame->topRailEmphasis',
        marker: 'visible result packet top rail uses stronger emphasis',
      },
    },
    null,
    2,
  ),
);
