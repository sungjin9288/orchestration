import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.briefing-charter \{\s*display:\s*grid;[\s\S]*gap:\s*12px;/);
assert.match(styles, /\.charter-card \{[\s\S]*position:\s*relative;[\s\S]*overflow:\s*hidden;[\s\S]*padding:\s*14px 16px;[\s\S]*border-radius:\s*20px;/);
assert.match(styles, /\.charter-card::before \{/);
assert.match(styles, /\.charter-card-goal \{[\s\S]*0 14px 32px rgba\(122, 88, 60, 0\.07\);/);
assert.match(styles, /\.charter-title \{[\s\S]*font-size:\s*1\.08rem;[\s\S]*max-width:\s*22ch;/);
assert.match(styles, /\.charter-copy \{[\s\S]*max-width:\s*34ch;/);
assert.match(styles, /\.charter-flow-step \{[\s\S]*padding:\s*10px 12px;[\s\S]*border-radius:\s*16px;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      charterVisualPolish: {
        markers: [
          'charter-card::before',
          'padding: 14px 16px',
          'border-radius: 20px',
          'font-size: 1.08rem',
        ],
      },
    },
    null,
    2,
  ),
);
