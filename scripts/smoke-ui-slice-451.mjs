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
  /\.harness-execution-result-hidden-packet::before\s*\{[\s\S]*width:\s*clamp\(102px,\s*31%,\s*146px\);[\s\S]*height:\s*3px;[\s\S]*border-radius:\s*999px;[\s\S]*background:\s*linear-gradient\(90deg,\s*color-mix\(in srgb,\s*var\(--execution\)\s*72%,\s*#ffffff\s*28%\),\s*transparent\);/s,
);
assert.ok(
  stylesCss.includes('box-shadow: 0 4px 10px rgba(55, 93, 120, 0.07);'),
  'hidden result packet rail should include the stronger lead shadow token',
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPacketTopRail: {
        insertionPoint: 'hiddenExecutionResultRegister->packetFrame->topRailEmphasis',
        marker: 'hidden result packet uses stronger top rail',
      },
    },
    null,
    2,
  ),
);
