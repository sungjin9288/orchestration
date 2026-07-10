import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.mission-row-head \{[\s\S]*align-items:\s*flex-start;[\s\S]*gap:\s*8px 10px;/);
assert.match(styles, /\.mission-row-head > strong \{[\s\S]*font-size:\s*1\.04rem;[\s\S]*letter-spacing:\s*-0\.012em;/);
assert.match(styles, /\.mission-row-head \.token-row \{[\s\S]*justify-content:\s*flex-end;[\s\S]*gap:\s*5px;/);
assert.match(styles, /\.mission-row-head \.token \{[\s\S]*box-shadow:\s*inset 0 1px 0 rgba\(255, 255, 255, 0\.46\);/);
assert.match(styles, /\.mission-row-card\.is-selected \.mission-row-head > strong \{/);
assert.match(styles, /\.mission-row-card\.is-selected \.mission-row-head \.token \{[\s\S]*0 8px 18px rgba\(21, 94, 117, 0\.06\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRowHeadHierarchy: {
        markers: [
          'align-items: flex-start',
          'font-size: 1.04rem',
          'gap: 5px',
          'inset 0 1px 0 rgba(255, 255, 255, 0.46)',
          '0 8px 18px rgba(21, 94, 117, 0.06)',
        ],
      },
    },
    null,
    2,
  ),
);
