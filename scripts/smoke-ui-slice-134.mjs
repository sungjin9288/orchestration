import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.cast-body \{[\s\S]*gap:\s*9px;/);
assert.match(styles, /\.cast-rank-row \{[\s\S]*gap:\s*6px;/);
assert.match(styles, /\.cast-rank \{[\s\S]*font-size:\s*0\.76rem;[\s\S]*letter-spacing:\s*0\.05em;/);
assert.match(styles, /\.cast-body > \.card-title-row \{[\s\S]*align-items:\s*flex-start;[\s\S]*gap:\s*8px 10px;/);
assert.match(styles, /\.cast-body > \.card-title-row > strong \{[\s\S]*font-size:\s*1rem;[\s\S]*letter-spacing:\s*-0\.012em;/);
assert.match(styles, /\.cast-body > \.card-title-row \.token \{[\s\S]*box-shadow:\s*inset 0 1px 0 rgba\(255, 255, 255, 0\.42\);/);
assert.match(styles, /\.cast-card-lead \.cast-body > \.card-title-row > strong \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilCastHeadHierarchy: {
        markers: [
          'cast-body gap: 9px',
          'cast-rank gap: 6px',
          'font-size: 0.76rem',
          'font-size: 1rem',
          'letter-spacing: -0.012em',
        ],
      },
    },
    null,
    2,
  ),
);
