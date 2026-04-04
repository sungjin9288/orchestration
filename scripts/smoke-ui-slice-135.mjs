import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.cast-command \{[\s\S]*font-size:\s*0\.84rem;[\s\S]*font-weight:\s*600;[\s\S]*letter-spacing:\s*-0\.01em;/);
assert.match(styles, /\.cast-subtitle \{[\s\S]*font-size:\s*0\.8rem;[\s\S]*opacity:\s*0\.92;/);
assert.match(styles, /\.cast-quote \{[\s\S]*padding:\s*8px 10px;[\s\S]*border-radius:\s*12px;[\s\S]*background:\s*rgba\(255, 255, 255, 0\.52\);[\s\S]*font-size:\s*0\.84rem;/);
assert.match(styles, /\.cast-card-lead \.cast-quote \{[\s\S]*background:\s*rgba\(255, 247, 236, 0\.72\);/);
assert.match(styles, /\.cast-quote-compact \{[\s\S]*-webkit-line-clamp:\s*3;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilCastBodyHierarchy: {
        markers: [
          'font-size: 0.84rem',
          'font-weight: 600',
          'font-size: 0.8rem',
          'padding: 8px 10px',
          'rgba(255, 247, 236, 0.72)',
        ],
      },
    },
    null,
    2,
  ),
);
